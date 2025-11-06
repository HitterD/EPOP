import { Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards, Get, Delete, Param } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import type { Response, Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { Inject } from '@nestjs/common'
import { REDIS_PUB } from '../redis/redis.module'
import Redis from 'ioredis'
import * as argon2 from 'argon2'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '../entities/user.entity'
import { Repository } from 'typeorm'
import { MailerService } from '../mailer/mailer.service'
import { ApiDefaultResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { ErrorResponse } from '../common/dto/error.dto'
import { SuccessResponse } from '../common/dto/success.dto'
import { randomUUID } from 'node:crypto'
import { OutboxService } from '../events/outbox.service'

@ApiTags('auth')
@ApiDefaultResponse({ type: ErrorResponse })
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    @Inject(REDIS_PUB) private readonly redis: Redis,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly mailer: MailerService,
    private readonly outbox: OutboxService,
  ) {}

  private cookieOpts(maxAgeSeconds: number) {
    const domain = this.config.get<string>('COOKIE_DOMAIN') || 'localhost'
    const secure = (this.config.get<string>('NODE_ENV') || 'development') === 'production'
    return {
      httpOnly: true as const,
      secure,
      sameSite: 'lax' as const,
      domain,
      path: '/',
      maxAge: maxAgeSeconds * 1000,
    }
  }

  @Post('login')
  @ApiOkResponse({ type: SuccessResponse })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.validateUser(dto.email, dto.password)
    const sessionId = randomUUID()
    const accessToken = await this.auth.signAccessToken(user, sessionId)
    const { token: refreshToken, jti } = await this.auth.signRefreshToken(user, sessionId)

    const accessTtl = this.config.get<number>('JWT_ACCESS_TTL') ?? 900
    const refreshTtl = this.config.get<number>('JWT_REFRESH_TTL') ?? 1209600

    res.cookie('accessToken', accessToken, this.cookieOpts(accessTtl))
    res.cookie('refreshToken', refreshToken, this.cookieOpts(refreshTtl))

    // Persist session in Redis
    const now = new Date().toISOString()
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || ''
    const ua = req.headers['user-agent'] || ''
    await this.redis.sadd(`sess:user:${user.id}`, sessionId)
    await this.redis.set(
      `sess:data:${sessionId}`,
      JSON.stringify({ id: sessionId, userId: String(user.id), ipAddress: ip, userAgent: ua, deviceName: '', deviceType: 'desktop', lastActiveAt: now, createdAt: now }),
      'EX',
      Math.max(3600, refreshTtl)
    )
    await this.redis.set(`sess:jti:${sessionId}`, jti, 'EX', Math.max(3600, refreshTtl))

    return { success: true }
  }

  @Post('refresh')
  @ApiOkResponse({ type: SuccessResponse })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refreshToken
    if (!token) throw new UnauthorizedException('Missing refresh token')

    const payload = await this.auth.verifyRefreshToken(token)
    if (payload.typ !== 'refresh') throw new UnauthorizedException('Invalid token')
    const sessionId = String(payload.sid || '')
    const jti = String(payload.jti || '')
    if (!sessionId || !jti) throw new UnauthorizedException('Invalid token')
    const saved = await this.redis.get(`sess:jti:${sessionId}`)
    if (!saved || saved !== jti) throw new UnauthorizedException('Token revoked')

    const accessTtl = this.config.get<number>('JWT_ACCESS_TTL') ?? 900
    const refreshTtl = this.config.get<number>('JWT_REFRESH_TTL') ?? 1209600

    const user = await this.users.findOne({ where: { id: payload.sub } })
    if (!user) throw new UnauthorizedException('User not found')
    const accessToken = await this.auth.signAccessToken(user, sessionId)
    const { token: refreshToken, jti: newJti } = await this.auth.signRefreshToken(user, sessionId)

    res.cookie('accessToken', accessToken, this.cookieOpts(accessTtl))
    res.cookie('refreshToken', refreshToken, this.cookieOpts(refreshTtl))
    await this.redis.set(`sess:jti:${sessionId}`, newJti, 'EX', Math.max(3600, refreshTtl))
    await this.redis.get(`sess:data:${sessionId}`).then((json) => {
      if (json) {
        try {
          const data = JSON.parse(json)
          data.lastActiveAt = new Date().toISOString()
          this.redis.set(`sess:data:${sessionId}`, JSON.stringify(data), 'EX', Math.max(3600, refreshTtl))
        } catch {}
      }
    })
    return { success: true }
  }

  @Post('logout')
  @ApiOkResponse({ type: SuccessResponse })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    return { success: true }
  }

  @Post('password/forgot')
  @ApiOkResponse({ type: SuccessResponse })
  async forgot(@Req() req: Request, @Body('email') email: string) {
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
    const ttl = this.config.get<number>('PWD_RESET_TTL') ?? 1800
    await this.redis.set(`pwdreset:${email}`, token, 'EX', Math.max(300, ttl))
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || ''
    const ua = req.headers['user-agent'] || ''
    await this.outbox.append({
      name: 'user.password.reset.requested',
      aggregateType: 'user',
      aggregateId: '0',
      userId: undefined,
      payload: { email, ip, ua },
    })
    await this.mailer.sendPasswordReset(email, token)
    return { success: true }
  }

  @Post('password/reset')
  @ApiOkResponse({ type: SuccessResponse })
  async reset(@Req() req: Request, @Body() body: { email: string; token: string; password: string }) {
    // one-time use: try to get & delete atomically if supported
    let saved: string | null = null
    const key = `pwdreset:${body.email}`
    const client: any = this.redis as any
    if (typeof client.getdel === 'function') {
      saved = await client.getdel(key)
    } else {
      saved = await this.redis.get(key)
      if (saved) await this.redis.del(key)
    }
    if (!saved || saved !== body.token) throw new UnauthorizedException('Invalid reset token')
    const user = await this.users.findOne({ where: { email: body.email } })
    if (!user) throw new UnauthorizedException('User not found')
    user.passwordHash = await argon2.hash(body.password)
    await this.users.save(user)
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || ''
    const ua = req.headers['user-agent'] || ''
    await this.outbox.append({
      name: 'user.password.reset.completed',
      aggregateType: 'user',
      aggregateId: user.id,
      userId: user.id,
      payload: { email: body.email, ip, ua },
    })
    return { success: true }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('push/subscribe')
  @ApiOkResponse({ type: SuccessResponse })
  async subscribePush(@Req() req: any, @Body() body: any) {
    const userId = req.user.userId
    await this.redis.set(`push:user:${userId}`, JSON.stringify(body))
    return { success: true }
  }

  // Sessions API
  @UseGuards(AuthGuard('jwt'))
  @Get('sessions')
  async listSessions(@Req() req: any) {
    const userId = String(req.user.userId)
    const currentSid = String(req.user.sid || '')
    const sids = await this.redis.smembers(`sess:user:${userId}`)
    const items: any[] = []
    for (const sid of sids) {
      const json = await this.redis.get(`sess:data:${sid}`)
      if (json) {
        try {
          const d = JSON.parse(json)
          items.push({
            id: sid,
            userId,
            deviceName: d.deviceName || 'Device',
            deviceType: d.deviceType || 'desktop',
            ipAddress: d.ipAddress || '',
            userAgent: d.userAgent || '',
            lastActiveAt: d.lastActiveAt || d.createdAt,
            createdAt: d.createdAt,
            isCurrent: sid === currentSid,
          })
        } catch {}
      }
    }
    items.sort((a, b) => String(b.lastActiveAt).localeCompare(String(a.lastActiveAt)))
    return items
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('sessions/:id')
  @ApiOkResponse({ type: SuccessResponse })
  async revokeSession(@Req() req: any, @Param('id') sid: string) {
    const userId = String(req.user.userId)
    const belongs = await this.redis.sismember(`sess:user:${userId}`, sid)
    if (!belongs) throw new UnauthorizedException('Session not found')
    await this.redis.srem(`sess:user:${userId}`, sid)
    await this.redis.del(`sess:data:${sid}`)
    await this.redis.del(`sess:jti:${sid}`)
    return { success: true }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('sessions/revoke-all')
  @ApiOkResponse({ type: SuccessResponse })
  async revokeAllSessions(@Req() req: any) {
    const userId = String(req.user.userId)
    const currentSid = String(req.user.sid || '')
    const sids = await this.redis.smembers(`sess:user:${userId}`)
    const toRemove = sids.filter((s) => s !== currentSid)
    if (toRemove.length) {
      await this.redis.srem(`sess:user:${userId}`, ...toRemove)
      for (const sid of toRemove) {
        await this.redis.del(`sess:data:${sid}`)
        await this.redis.del(`sess:jti:${sid}`)
      }
    }
    return { success: true }
  }
}
