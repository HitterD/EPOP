import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, from, of, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import Redis from 'ioredis'
import { REDIS_PUB } from '../../redis/redis.module'

function isIdempotentMethod(method?: string) {
  const m = (method || '').toUpperCase()
  return m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE'
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject(REDIS_PUB) private readonly redis: Redis) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const ctx = context.switchToHttp()
    const req: any = ctx.getRequest()
    const res = ctx.getResponse()

    const key = (req.headers['idempotency-key'] as string | undefined) || undefined
    if (!key || !isIdempotentMethod(req.method)) {
      return next.handle()
    }

    const redisKey = `idem:${req.method}:${req.originalUrl}:${key}`

    // If cached, short-circuit
    try {
      const cached = await this.redis.get(redisKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        res.status(parsed.status || 200)
        return of(parsed.body)
      }
    } catch {}

    // Capture the response and store
    const requestId = (req as any).requestId || null
    const traceId = (req as any).traceId || requestId

    return next.handle().pipe(
      tap(async (body) => {
        try {
          const payload = JSON.stringify({ status: res.statusCode, body, requestId, traceId })
          // 24h TTL
          await this.redis.setex(redisKey, 60 * 60 * 24, payload)
        } catch {}
      }),
      catchError((err) => {
        // Do not cache errors
        return throwError(() => err)
      }),
    )
  }
}
