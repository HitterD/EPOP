import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { catchError, finalize } from 'rxjs/operators'
import { Counter, Gauge, Histogram } from 'prom-client'

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
})

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
})

const inFlight = new Gauge({
  name: 'http_requests_in_flight',
  help: 'Current number of in-flight HTTP requests',
})

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp()
    const req: any = http.getRequest()
    const res: any = http.getResponse()

    // Derive labels
    const method = String(req.method || 'GET').toUpperCase()
    const route = String((req.route?.path || req.path || req.originalUrl || 'unknown').split('?')[0])

    // Start tracking
    inFlight.inc()
    const endTimer = httpDuration.startTimer()

    return next.handle().pipe(
      catchError((err) => {
        // error is handled by filters; still record duration/requests in finalize
        throw err
      }),
      finalize(() => {
        const status = Number(res.statusCode || 500)
        const labels = { method, route, status_code: String(status) }
        httpRequests.inc(labels)
        endTimer(labels as any)
        inFlight.dec()
      }),
    )
  }
}
