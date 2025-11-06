import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`

export default defineConfig({
  testDir: 'e2e',
  /* Maximum time one test can run for. */
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only. */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI to reduce flakiness. */
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Optional local server start (set E2E_START_SERVER=1)
  webServer: process.env.E2E_START_SERVER
    ? {
        command: process.env.E2E_START_COMMAND || 'node server.js',
        port: PORT,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
})
