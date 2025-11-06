import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('File Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('http://localhost:3000/files')
  })

  test('should display files list', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    await expect(page.locator('[data-testid="files-list"]')).toBeVisible()
  })

  test('should upload a file', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Click upload button
    await page.click('[data-testid="upload-button"]')
    
    // Upload file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-upload.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test file content'),
    })
    
    // Wait for upload to complete
    await page.waitForSelector('[data-testid="upload-success"]', { timeout: 10000 })
    
    // Verify file appears in list
    await expect(page.locator('text=test-upload.txt')).toBeVisible()
  })

  test('should upload multiple files', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    await page.click('[data-testid="upload-button"]')
    
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles([
      {
        name: 'file1.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('File 1'),
      },
      {
        name: 'file2.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('File 2'),
      },
    ])
    
    // Wait for both uploads
    await page.waitForSelector('text=file1.txt', { timeout: 10000 })
    await page.waitForSelector('text=file2.txt', { timeout: 10000 })
    
    await expect(page.locator('text=file1.txt')).toBeVisible()
    await expect(page.locator('text=file2.txt')).toBeVisible()
  })

  test('should preview image file', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Click on an image file
    await page.click('[data-testid="file-item"][data-type="image"]')
    
    // Verify preview modal opens
    await expect(page.locator('[data-testid="file-preview-modal"]')).toBeVisible()
    await expect(page.locator('img[alt*="preview"]')).toBeVisible()
  })

  test('should preview PDF file', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Click on a PDF file
    await page.click('[data-testid="file-item"][data-type="pdf"]')
    
    // Verify PDF preview loads
    await expect(page.locator('[data-testid="pdf-preview"]')).toBeVisible()
    
    // Test navigation
    await page.click('[data-testid="pdf-next-page"]')
    await expect(page.locator('text=Page 2')).toBeVisible()
  })

  test('should download file', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Setup download listener
    const downloadPromise = page.waitForEvent('download')
    
    // Click download button
    await page.click('[data-testid="file-item"]:first-child [data-testid="download-button"]')
    
    // Wait for download to start
    const download = await downloadPromise
    
    // Verify download started
    expect(download.suggestedFilename()).toBeTruthy()
  })

  test('should delete file', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Get file count before deletion
    const filesBefore = await page.locator('[data-testid="file-item"]').count()
    
    // Click delete on first file
    await page.click('[data-testid="file-item"]:first-child [data-testid="delete-button"]')
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]')
    
    // Wait for deletion to complete
    await page.waitForTimeout(1000)
    
    // Verify file count decreased
    const filesAfter = await page.locator('[data-testid="file-item"]').count()
    expect(filesAfter).toBe(filesBefore - 1)
  })

  test('should search files', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Type in search box
    await page.fill('[data-testid="file-search"]', 'document')
    
    // Wait for results
    await page.waitForTimeout(500)
    
    // Verify filtered results
    const results = page.locator('[data-testid="file-item"]')
    const count = await results.count()
    
    // All visible results should contain 'document'
    for (let i = 0; i < count; i++) {
      const text = await results.nth(i).textContent()
      expect(text?.toLowerCase()).toContain('document')
    }
  })

  test('should filter files by type', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Click filter dropdown
    await page.click('[data-testid="file-type-filter"]')
    
    // Select PDF filter
    await page.click('[data-testid="filter-pdf"]')
    
    // Verify only PDFs are shown
    const files = await page.locator('[data-testid="file-item"]').all()
    for (const file of files) {
      const type = await file.getAttribute('data-type')
      expect(type).toBe('pdf')
    }
  })

  test('should rename file', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Click rename button
    await page.click('[data-testid="file-item"]:first-child [data-testid="rename-button"]')
    
    // Enter new name
    await page.fill('[data-testid="rename-input"]', 'renamed-file.txt')
    
    // Confirm rename
    await page.click('[data-testid="confirm-rename"]')
    
    // Verify new name appears
    await expect(page.locator('text=renamed-file.txt')).toBeVisible()
  })

  test('should share file', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Click share button
    await page.click('[data-testid="file-item"]:first-child [data-testid="share-button"]')
    
    // Verify share modal opens
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible()
    
    // Select user to share with
    await page.click('[data-testid="user-select"]')
    await page.click('[data-testid="user-option"]:first-child')
    
    // Set permissions
    await page.click('[data-testid="permission-view"]')
    
    // Confirm share
    await page.click('[data-testid="confirm-share"]')
    
    // Verify success message
    await expect(page.locator('text=File shared successfully')).toBeVisible()
  })

  test('should create folder', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Click new folder button
    await page.click('[data-testid="new-folder-button"]')
    
    // Enter folder name
    await page.fill('[data-testid="folder-name-input"]', 'Test Folder')
    
    // Create folder
    await page.click('[data-testid="create-folder"]')
    
    // Verify folder appears
    await expect(page.locator('text=Test Folder')).toBeVisible()
    await expect(page.locator('[data-testid="folder-icon"]')).toBeVisible()
  })

  test('should move file to folder', async ({ page }) => {
    await page.goto('http://localhost:3000/files')
    
    // Select a file
    await page.click('[data-testid="file-item"]:first-child [data-testid="select-checkbox"]')
    
    // Click move button
    await page.click('[data-testid="move-button"]')
    
    // Select destination folder
    await page.click('[data-testid="folder-option"]:first-child')
    
    // Confirm move
    await page.click('[data-testid="confirm-move"]')
    
    // Verify success
    await expect(page.locator('text=File moved successfully')).toBeVisible()
  })
})
