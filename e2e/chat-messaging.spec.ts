import { test, expect } from '@playwright/test'

test.describe('Chat Messaging', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('http://localhost:3000/chat')
  })

  test('should display chat list', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="chat-item"]').first()).toBeVisible()
  })

  test('should open a chat and display messages', async ({ page }) => {
    // Click on first chat
    await page.click('[data-testid="chat-item"]:first-child')
    
    // Wait for messages to load
    await page.waitForSelector('[data-testid="message-list"]')
    await expect(page.locator('[data-testid="message-list"]')).toBeVisible()
  })

  test('should send a message', async ({ page }) => {
    // Open a chat
    await page.click('[data-testid="chat-item"]:first-child')
    
    // Type message
    const messageInput = page.locator('[data-testid="message-input"]')
    await messageInput.fill('Hello, this is a test message!')
    
    // Send message
    await page.click('[data-testid="send-button"]')
    
    // Verify message appears
    await expect(page.locator('text=Hello, this is a test message!')).toBeVisible()
  })

  test('should send message with Enter key', async ({ page }) => {
    await page.click('[data-testid="chat-item"]:first-child')
    
    const messageInput = page.locator('[data-testid="message-input"]')
    await messageInput.fill('Message sent with Enter')
    await messageInput.press('Enter')
    
    await expect(page.locator('text=Message sent with Enter')).toBeVisible()
  })

  test('should display typing indicator', async ({ page }) => {
    await page.click('[data-testid="chat-item"]:first-child')
    
    // Start typing (this would trigger typing indicator via websocket in real scenario)
    const messageInput = page.locator('[data-testid="message-input"]')
    await messageInput.fill('Typing...')
    
    // In real test, we'd verify typing indicator appears for other users
    // This requires multiple browser contexts
  })

  test('should attach file to message', async ({ page }) => {
    await page.click('[data-testid="chat-item"]:first-child')
    
    // Click attach button
    await page.click('[data-testid="attach-button"]')
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content'),
    })
    
    // Verify file appears in preview
    await expect(page.locator('text=test-document.pdf')).toBeVisible()
    
    // Send message with attachment
    await page.click('[data-testid="send-button"]')
    
    // Verify attachment appears in message
    await expect(page.locator('[data-testid="message-attachment"]')).toBeVisible()
  })

  test('should search messages', async ({ page }) => {
    // Open search
    await page.click('[data-testid="search-button"]')
    
    // Search for text
    await page.fill('[data-testid="search-input"]', 'test message')
    
    // Wait for results
    await page.waitForSelector('[data-testid="search-results"]')
    await expect(page.locator('[data-testid="search-result-item"]')).toHaveCount(1, { 
      timeout: 5000 
    })
  })

  test('should react to message', async ({ page }) => {
    await page.click('[data-testid="chat-item"]:first-child')
    
    // Hover over message to show reactions button
    const firstMessage = page.locator('[data-testid="message-bubble"]').first()
    await firstMessage.hover()
    
    // Click reactions button
    await page.click('[data-testid="add-reaction-button"]')
    
    // Select emoji
    await page.click('[data-testid="emoji-👍"]')
    
    // Verify reaction appears
    await expect(page.locator('[data-testid="message-reaction"]:has-text("👍")')).toBeVisible()
  })

  test('should delete own message', async ({ page }) => {
    await page.click('[data-testid="chat-item"]:first-child')
    
    // Send a message first
    await page.fill('[data-testid="message-input"]', 'Message to delete')
    await page.click('[data-testid="send-button"]')
    
    // Wait for message to appear
    const messageToDelete = page.locator('text=Message to delete')
    await expect(messageToDelete).toBeVisible()
    
    // Open message menu
    await messageToDelete.hover()
    await page.click('[data-testid="message-menu-button"]')
    
    // Click delete
    await page.click('[data-testid="delete-message-button"]')
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]')
    
    // Verify message is deleted
    await expect(messageToDelete).not.toBeVisible()
  })

  test('should reply to message', async ({ page }) => {
    await page.click('[data-testid="chat-item"]:first-child')
    
    // Click reply on first message
    const firstMessage = page.locator('[data-testid="message-bubble"]').first()
    await firstMessage.hover()
    await page.click('[data-testid="reply-button"]')
    
    // Type reply
    await page.fill('[data-testid="message-input"]', 'This is a reply')
    await page.click('[data-testid="send-button"]')
    
    // Verify reply appears with reference
    await expect(page.locator('[data-testid="message-reply-reference"]')).toBeVisible()
  })

  test('should show read receipts', async ({ page }) => {
    await page.click('[data-testid="chat-item"]:first-child')
    
    // Send a message
    await page.fill('[data-testid="message-input"]', 'Read receipt test')
    await page.click('[data-testid="send-button"]')
    
    // Wait and check for read receipt indicator
    const sentMessage = page.locator('text=Read receipt test')
    await expect(sentMessage).toBeVisible()
    
    // Check for status indicator (sent/delivered/read)
    await expect(page.locator('[data-testid="message-status"]')).toBeVisible()
  })

  test('should create new group chat', async ({ page }) => {
    // Click new chat button
    await page.click('[data-testid="new-chat-button"]')
    
    // Select group chat option
    await page.click('[data-testid="new-group-chat"]')
    
    // Enter group name
    await page.fill('[data-testid="group-name-input"]', 'Test Group')
    
    // Select members
    await page.click('[data-testid="member-select"]')
    await page.click('[data-testid="member-option"]:first-child')
    await page.click('[data-testid="member-option"]:nth-child(2)')
    
    // Create group
    await page.click('[data-testid="create-group-button"]')
    
    // Verify group created
    await expect(page.locator('text=Test Group')).toBeVisible()
  })
})
