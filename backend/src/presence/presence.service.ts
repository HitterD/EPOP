import { Inject, Injectable } from '@nestjs/common'
import { REDIS_PUB } from '../redis/redis.module'
import Redis from 'ioredis'

@Injectable()
export class PresenceService {
  constructor(@Inject(REDIS_PUB) private readonly redis: Redis) {}

  async heartbeat(userId: string, ttlSeconds = 60) {
    const key = `presence:user:${userId}`
    await this.redis.set(key, '1', 'EX', ttlSeconds)
    return { ok: true, ttl: ttlSeconds }
  }

  async get(userId: string) {
    const exists = await this.redis.exists(`presence:user:${userId}`)
    return { userId, online: exists === 1 }
  }
}
