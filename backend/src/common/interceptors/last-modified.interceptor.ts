import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Response } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LastModifiedInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const res = ctx.getResponse<Response>()
    return next.handle().pipe(
      tap((body) => {
        try {
          // Attempt to set Last-Modified based on response body
          let last: Date | null = null
          if (Array.isArray(body) && body.length) {
            const dates = body.map((it: any) => new Date(it.updatedAt || it.createdAt || Date.now())).filter((d: any) => !isNaN(d))
            if (dates.length) last = new Date(Math.max(...dates.map((d: any) => d.getTime())))
          } else if (body && typeof body === 'object') {
            const d = new Date((body as any).updatedAt || (body as any).createdAt || Date.now())
            if (!isNaN(d as any)) last = d
          }
          if (last) res.setHeader('Last-Modified', last.toUTCString())
        } catch {}
      }),
    )
  }
}
