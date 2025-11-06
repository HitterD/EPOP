import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const req = ctx.getRequest<Request>()

    const isHttp = exception instanceof HttpException
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let code = isHttp ? (exception.name || 'HttpException') : 'InternalServerError'
    let message = isHttp ? exception.message : 'Internal server error'
    let details: any = undefined

    if (isHttp) {
      const body = exception.getResponse()
      if (typeof body === 'object' && body !== null) {
        const b: any = body
        if (b.code) code = b.code
        if (b.message) message = Array.isArray(b.message) ? b.message.join('; ') : String(b.message)
        if (b.error) details = b.error
        if (b.details) details = b.details
      }
    } else if (exception && typeof (exception as any).message === 'string') {
      message = (exception as any).message
    }

    const requestId = (req as any).requestId || req.headers['x-request-id'] || null
    const traceId = (req as any).traceId || req.headers['x-trace-id'] || requestId

    res.status(status).json({
      code,
      message,
      details,
      requestId,
      traceId,
      ts: new Date().toISOString(),
      path: req.originalUrl || req.url,
    })
  }
}
