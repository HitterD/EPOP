# Verification Guide (CI Gates)

This document explains how to verify the project locally and what CI enforces on every PR and push to `main`.

## Local Verification

- **Install**
```bash
npm ci
```

- **Type check**
```bash
npm run type-check
```

- **Lint**
```bash
npm run lint
```

- **Build**
```bash
npm run build
```

- **Unit tests (Jest)**
```bash
npm test -- --ci --coverage
```
Coverage reports go to `coverage/`.

- **E2E tests (Playwright)**
Runs against a local server. The Playwright config can auto-start the server.
```bash
# Install browsers once
npx playwright install --with-deps

# Recommended: auto-start server via env
E2E_START_SERVER=1 PORT=3000 npm run test:e2e
```
Playwright report goes to `playwright-report/`.

## CI Workflow

CI runs on GitHub Actions and enforces:
- **Type check**: `npm run type-check`
- **Lint**: `npm run lint`
- **Build**: `npm run build`
- **Unit tests**: `npm test -- --ci --coverage`
- **E2E tests**: `npm run test:e2e` with auto-start server
- **Artifacts** uploaded:
  - `coverage/`
  - `playwright-report/`
  - Aggregated `artifacts/` (contains copies of the above)

## Failure Gates

The CI job fails if any of the following steps fail:
- Type checking errors
- ESLint errors
- Build failure (Next.js build)
- Jest test failures
- Playwright test failures

## Troubleshooting

- **Playwright timeout**: Ensure server is reachable at `http://localhost:3000`. Use `E2E_START_SERVER=1` or run `npm start` in another terminal.
- **Coverage thresholds**: See `jest.config.js` for current global thresholds. Adjust tests or thresholds if justified.
- **Port conflicts**: Set `PORT=3001` (also update `E2E_BASE_URL` or rely on Playwright config `BASE_URL`).
