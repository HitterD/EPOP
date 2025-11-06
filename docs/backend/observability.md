# Observability

- **Trace propagation**
  - Middleware adds `X-Request-Id` and `X-Trace-Id` headers on every response.
  - Available in Express via `req.requestId` and `req.traceId` for downstream logging.
  - Source: `backend/src/common/middleware/trace-id.middleware.ts`

- **Error envelope**
  - All exceptions are formatted as:
    ```json
    {
      "code": "HttpException|InternalServerError|...",
      "message": "...",
      "details": {"...": "..."},
      "requestId": "uuid",
      "traceId": "uuid",
      "ts": "2025-01-01T00:00:00.000Z",
      "path": "/api/..."
    }
    ```
  - Global filter: `backend/src/common/filters/all-exceptions.filter.ts`

- **Prometheus metrics**
  - Endpoint: `GET /metrics` (excluded from `/api` prefix; throttling skipped).
  - Collected by `prom-client` with default Node.js process metrics and HTTP metrics:
    - `http_requests_total{method,route,status_code}`
    - `http_request_duration_seconds_bucket|sum|count{method,route,status_code}`
    - `http_requests_in_flight`
  - Implementation:
    - Module: `backend/src/metrics/metrics.module.ts`
    - Controller: `backend/src/metrics/metrics.controller.ts`
    - Interceptor: `backend/src/metrics/metrics.interceptor.ts`
    - Service (default metrics): `backend/src/metrics/metrics.service.ts`
  - Configure Prometheus to scrape: `http://<api-host>:4000/metrics`

- **Security headers + limits**
  - CSP, nosniff, disable x-powered-by, strong ETag, JSON/urlencoded size limits (10MB).
  - Source: `backend/src/main.ts`

- **Swagger/OpenAPI**
  - Available at `/docs` with bearer auth.
  - Source: `backend/src/main.ts`
