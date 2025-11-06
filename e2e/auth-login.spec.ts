import { test, expect } from '@playwright/test'

// Seeded credentials from mock DB in app/api/auth/login/route.ts and lib/db/mock-data.ts
const EMAIL = 'admin@epop.com'
const PASSWORD = 'password123'

test.describe('Auth - Login', () => {
  test('should login and redirect to dashboard, session persists', async ({ page }) => {
    await page.goto('/login')

    await page.fill('#email', EMAIL)
    await page.fill('#password', PASSWORD)
    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard', { timeout: 20000 })
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText("Welcome back! Here's what's happening.")).toBeVisible()

    await page.reload()
    await expect(page).toHaveURL(/\/dashboard$/)
  })
})
