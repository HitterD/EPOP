import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { catchError, finalize } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp()
    const req: any = http.getRequest()
    const res: any = http.getResponse()

    const start = process.hrtime.bigint()
    const method = String(req.method || 'GET').toUpperCase()
    const path = String((req.route?.path || req.originalUrl || req.url || ''))
    const requestId = req.requestId || req.headers['x-request-id'] || null
    const traceId = req.traceId || req.headers['x-trace-id'] || requestId

    return next.handle().pipe(
      catchError((err) => { throw err }),
      finalize(() => {
        const end = process.hrtime.bigint()
        const ms = Number(end - start) / 1_000_000
        const status = Number(res.statusCode || 0)
        const msg = {
          level: 'info',
          msg: 'http_request',
          method,
          path,
          status,
          duration_ms: Math.round(ms * 100) / 100,
          requestId,
          traceId,
        }
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(msg))
      }),
    )
  }
}
