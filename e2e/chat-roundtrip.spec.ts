import { test, expect } from '@playwright/test'

const base = 'http://localhost:3000'

async function login(page) {
  await page.goto(`${base}/login`)
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL(`${base}/chat`)
}

test('E2E Chat Round-Trip: send → receive → mark read', async ({ page }) => {
  await login(page)

  // Navigate to a deterministic chat
  await page.goto(`${base}/chat/chat-1`)
  await page.waitForSelector('[data-testid="message-list"]')

  const text = `RoundTrip ${Date.now()}`
  await page.fill('[data-testid="message-input"]', text)
  await page.click('[data-testid="send-button"]')
  await expect(page.locator(`text=${text}`)).toBeVisible()

  // Fetch messages via API to get messageId
  const res = await page.request.get(`/api/chats/chat-1/messages?limit=10`)
  expect(res.ok()).toBeTruthy()
  const body = await res.json()
  const items = body?.data?.items as Array<{ id: string; content: string }> | undefined
  expect(Array.isArray(items)).toBeTruthy()
  const found = items?.find((m) => m.content === text)
  expect(found?.id).toBeTruthy()

  // Mark as read (idempotent)
  const mark = await page.request.post(`/api/chats/chat-1/messages/${found!.id}/read`, {
    headers: { 'Idempotency-Key': `${Date.now()}-rt` },
  })
  expect(mark.ok()).toBeTruthy()
})
