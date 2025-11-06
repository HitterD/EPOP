import { test, expect } from '@playwright/test'

test.describe('Projects and Tasks', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('http://localhost:3000/projects')
  })

  test('should display projects list', async ({ page }) => {
    await expect(page.locator('[data-testid="projects-list"]')).toBeVisible()
  })

  test('should create new project', async ({ page }) => {
    // Click new project button
    await page.click('[data-testid="new-project-button"]')
    
    // Fill project details
    await page.fill('[data-testid="project-name"]', 'Test Project')
    await page.fill('[data-testid="project-description"]', 'This is a test project')
    
    // Create project
    await page.click('[data-testid="create-project"]')
    
    // Verify project created
    await expect(page.locator('text=Test Project')).toBeVisible()
  })

  test('should open project board view', async ({ page }) => {
    // Click on first project
    await page.click('[data-testid="project-item"]:first-child')
    
    // Verify board view loads
    await expect(page.locator('[data-testid="project-board"]')).toBeVisible()
    await expect(page.locator('[data-testid="board-column"]')).toHaveCount(3) // To Do, In Progress, Done
  })

  test('should create new task', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    
    // Click add task in first column
    await page.click('[data-testid="add-task-button"]')
    
    // Fill task details
    await page.fill('[data-testid="task-title"]', 'Test Task')
    await page.fill('[data-testid="task-description"]', 'Task description')
    
    // Set priority
    await page.click('[data-testid="priority-select"]')
    await page.click('[data-testid="priority-high"]')
    
    // Create task
    await page.click('[data-testid="create-task"]')
    
    // Verify task appears
    await expect(page.locator('text=Test Task')).toBeVisible()
  })

  test('should drag task between columns', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    
    // Get task card
    const taskCard = page.locator('[data-testid="task-card"]').first()
    
    // Get target column
    const targetColumn = page.locator('[data-testid="board-column"]:nth-child(2)')
    
    // Drag and drop
    await taskCard.dragTo(targetColumn)
    
    // Verify task moved
    const tasksInTargetColumn = targetColumn.locator('[data-testid="task-card"]')
    await expect(tasksInTargetColumn).toContainText(await taskCard.textContent() || '')
  })

  test('should edit task', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    
    // Click on task card
    await page.click('[data-testid="task-card"]:first-child')
    
    // Verify task modal opens
    await expect(page.locator('[data-testid="task-modal"]')).toBeVisible()
    
    // Edit title
    await page.fill('[data-testid="task-title-edit"]', 'Updated Task Title')
    
    // Save changes
    await page.click('[data-testid="save-task"]')
    
    // Verify update
    await expect(page.locator('text=Updated Task Title')).toBeVisible()
  })

  test('should assign task to user', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    await page.click('[data-testid="task-card"]:first-child')
    
    // Click assign button
    await page.click('[data-testid="assign-button"]')
    
    // Select user
    await page.click('[data-testid="user-option"]:first-child')
    
    // Verify assignment
    await expect(page.locator('[data-testid="assignee-avatar"]')).toBeVisible()
  })

  test('should set task due date', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    await page.click('[data-testid="task-card"]:first-child')
    
    // Click due date picker
    await page.click('[data-testid="due-date-picker"]')
    
    // Select tomorrow
    await page.click('[data-testid="date-tomorrow"]')
    
    // Verify due date set
    await expect(page.locator('[data-testid="task-due-date"]')).toBeVisible()
  })

  test('should add comment to task', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    await page.click('[data-testid="task-card"]:first-child')
    
    // Scroll to comments section
    await page.locator('[data-testid="comments-section"]').scrollIntoViewIfNeeded()
    
    // Add comment
    await page.fill('[data-testid="comment-input"]', 'This is a test comment')
    await page.click('[data-testid="add-comment"]')
    
    // Verify comment appears
    await expect(page.locator('text=This is a test comment')).toBeVisible()
  })

  test('should delete task', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    
    // Get initial task count
    const tasksBefore = await page.locator('[data-testid="task-card"]').count()
    
    // Open task
    await page.click('[data-testid="task-card"]:first-child')
    
    // Delete task
    await page.click('[data-testid="delete-task-button"]')
    await page.click('[data-testid="confirm-delete"]')
    
    // Verify task deleted
    await page.waitForTimeout(1000)
    const tasksAfter = await page.locator('[data-testid="task-card"]').count()
    expect(tasksAfter).toBe(tasksBefore - 1)
  })

  test('should filter tasks by assignee', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    
    // Click filter button
    await page.click('[data-testid="filter-button"]')
    
    // Select assignee filter
    await page.click('[data-testid="filter-assignee"]')
    await page.click('[data-testid="assignee-option"]:first-child')
    
    // Apply filter
    await page.click('[data-testid="apply-filter"]')
    
    // Verify filtered results
    const tasks = await page.locator('[data-testid="task-card"]').all()
    expect(tasks.length).toBeGreaterThan(0)
  })

  test('should switch to timeline view', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    
    // Click timeline view button
    await page.click('[data-testid="view-timeline"]')
    
    // Verify timeline loads
    await expect(page.locator('[data-testid="timeline-view"]')).toBeVisible()
    await expect(page.locator('[data-testid="timeline-task"]')).toHaveCount(1, { 
      timeout: 5000 
    })
  })

  test('should switch to grid view', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    
    // Click grid view button
    await page.click('[data-testid="view-grid"]')
    
    // Verify grid loads
    await expect(page.locator('[data-testid="grid-view"]')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })

  test('should export project data', async ({ page }) => {
    await page.click('[data-testid="project-item"]:first-child')
    
    // Setup download listener
    const downloadPromise = page.waitForEvent('download')
    
    // Click export button
    await page.click('[data-testid="export-button"]')
    await page.click('[data-testid="export-csv"]')
    
    // Wait for download
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.csv')
  })
})
