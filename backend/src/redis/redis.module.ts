import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const REDIS_PUB = Symbol('REDIS_PUB')
export const REDIS_SUB = Symbol('REDIS_SUB')

@Global()
@Module({
  providers: [
    {
      provide: REDIS_PUB,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
        return new Redis(url, { lazyConnect: false, maxRetriesPerRequest: null })
      },
    },
    {
      provide: REDIS_SUB,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
        return new Redis(url, { lazyConnect: false, maxRetriesPerRequest: null })
      },
    },
  ],
  exports: [REDIS_PUB, REDIS_SUB],
})
export class RedisModule {}
