import { test, expect } from '@playwright/test'

test.describe('Auth - Redirects', () => {
  test('should redirect unauthenticated user from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login(\?.*)?$/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })
})
