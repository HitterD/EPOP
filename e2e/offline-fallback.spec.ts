import { test, expect } from '@playwright/test'

const base = 'http://localhost:3000'

test('Offline fallback page displays when network is cut', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(base)
  await expect(page).toHaveTitle(/EPOP/i)

  await context.setOffline(true)
  await page.goto(`${base}/some/random/path`, { waitUntil: 'commit' })

  // Should show offline fallback cached by service worker
  await expect(page.locator('h1')).toHaveText(/offline/i)
  await expect(page.locator('text=Back to Home')).toBeVisible()

  await context.setOffline(false)
})
