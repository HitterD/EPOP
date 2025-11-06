import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'

export interface JwtPayload {
  sub: string
  email?: string
  name?: string
  typ?: string
  sid?: string
  adm?: boolean
}

function extractFromCookies(req: Request) {
  const token = req.cookies?.accessToken
  return token || null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractFromCookies,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    })
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email, name: payload.name, sid: payload.sid, adm: !!payload.adm }
  }
}
