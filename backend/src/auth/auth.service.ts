import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as argon2 from 'argon2'
import { randomUUID } from 'node:crypto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const ok = await argon2.verify(user.passwordHash, password)
    if (!ok) throw new UnauthorizedException('Invalid credentials')
    return user
  }

  async signAccessToken(user: User, sessionId: string) {
    const payload = { sub: user.id, email: user.email, name: user.displayName, sid: sessionId, adm: !!user.isAdmin }
    return this.jwt.signAsync(payload)
  }

  async signRefreshToken(user: User, sessionId: string): Promise<{ token: string; jti: string }> {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET')!
    const ttl = this.config.get<number>('JWT_REFRESH_TTL') ?? 1209600
    const jti = randomUUID()
    const payload = { sub: user.id, typ: 'refresh', sid: sessionId, jti }
    const token = await this.jwt.signAsync(payload, { secret, expiresIn: `${ttl}s` })
    return { token, jti }
  }

  async verifyRefreshToken(token: string) {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET')!
    return this.jwt.verifyAsync(token, { secret })
  }
}
