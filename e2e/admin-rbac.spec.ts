import { test, expect } from '@playwright/test'

const ADMIN = { email: 'admin@epop.com', password: 'password123' }
const MEMBER = { email: 'john.doe@epop.com', password: 'password123' }

async function login(page, { email, password }) {
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
}

test.describe('RBAC - Admin vs Member', () => {
  test('member is redirected when accessing /admin/users', async ({ page }) => {
    await login(page, MEMBER)
    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/dashboard\?forbidden=1/)
  })

  test('admin can access /admin/users', async ({ page }) => {
    await login(page, ADMIN)
    await page.goto('/admin/users')
    await expect(page.getByText('Admin • Users')).toBeVisible()
    await expect(page.getByRole('button', { name: 'New User' })).toBeVisible()
  })
})
