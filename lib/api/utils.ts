import { CursorPaginationParams } from '@/types'

/**
 * Build query string for cursor pagination
 */
export function buildCursorQuery(params: CursorPaginationParams): string {
  const queryParams = new URLSearchParams()
  
  if (params.cursor) {
    queryParams.set('cursor', params.cursor)
  }
  
  if (params.limit) {
    queryParams.set('limit', params.limit.toString())
  }
  
  const queryString = queryParams.toString()
  return queryString ? `?${queryString}` : ''
}

/**
 * Generate idempotency key for requests
 */
export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Add idempotency key header to request options
 */
export function withIdempotencyKey(options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: {
      ...options.headers,
      'Idempotency-Key': generateIdempotencyKey(),
    },
  }
}

/**
 * Add trace ID header to request options
 */
export function withTraceId(traceId: string, options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-Request-Id': traceId,
    },
  }
}

/**
 * Generate trace ID
 */
export function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
}
