# Security Controls

- **Headers & CSP** (`backend/src/main.ts`)
  - Helmet with CSP:
    - `default-src 'none'`
    - `img-src 'self' data:`
    - `style-src 'self' 'unsafe-inline'`
    - `script-src 'self'`
    - `connect-src 'self'`
    - `frame-ancestors 'none'`
  - `X-Content-Type-Options: nosniff`; CORP same-origin; disable x-powered-by.

- **Rate limiting** (`backend/src/app.module.ts`)
  - Global `ThrottlerGuard`; window/limit via env `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`.

- **Request limits**
  - JSON/urlencoded body size: 10MB (`express.json/urlencoded`).

- **Auth tokens**
  - JWT in httpOnly cookies; refresh rotation (one-time JTI per session).
  - Sessions stored in Redis under `sess:*`.

- **Idempotency**
  - Header `Idempotency-Key`, cached 24h in Redis for write operations.

- **HTML sanitization**
  - Mail/compose body sanitized server-side via `sanitizeHtml()` in `backend/src/common/utils/sanitize-html.ts`.
