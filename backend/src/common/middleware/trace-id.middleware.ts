import { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'node:crypto'

export function createTraceIdMiddleware() {
  return function traceId(req: Request, res: Response, next: NextFunction) {
    const headerReqId = (req.headers['x-request-id'] as string | undefined) || undefined
    const headerTrace = (req.headers['x-trace-id'] as string | undefined) || undefined
    const requestId = headerReqId || randomUUID()
    const traceId = headerTrace || requestId
    ;(req as any).requestId = requestId
    ;(req as any).traceId = traceId
    res.setHeader('X-Request-Id', requestId)
    res.setHeader('X-Trace-Id', traceId)
    next()
  }
}
