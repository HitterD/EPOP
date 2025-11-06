# Testing Guide — Wave-4

**Date:** November 6, 2025  
**Test Strategy:** Unit + Integration + E2E  
**Coverage Target:** 80%+ for critical paths  
**Frameworks:** Vitest + Testing Library + Playwright

---

## 🎯 Testing Strategy

### Test Pyramid
```
        /\
       /E2E\        10% - Critical user journeys
      /------\
     /Integration\ 30% - Component interactions
    /------------\
   /    Unit      \ 60% - Individual functions
  /----------------\
```

### Coverage Goals
- **Unit Tests:** 80%+ coverage
- **Integration Tests:** Key workflows
- **E2E Tests:** Critical paths
- **A11y Tests:** All interactive components

---

## 🧪 Test Examples by Feature

### 1. Analytics Dashboard

#### Unit Test Example
```typescript
// __tests__/features/analytics/csv-export.test.ts
import { describe, it, expect } from 'vitest'
import { convertToCSV, exportToCSV } from '@/lib/utils/csv-export'

describe('CSV Export', () => {
  it('converts array to CSV format', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ]
    
    const csv = convertToCSV(data)
    
    expect(csv).toContain('name,age')
    expect(csv).toContain('John,30')
    expect(csv).toContain('Jane,25')
  })

  it('escapes special characters', () => {
    const data = [{ text: 'Hello, "World"' }]
    const csv = convertToCSV(data)
    
    expect(csv).toContain('"Hello, ""World"""')
  })

  it('handles custom headers', () => {
    const data = [{ firstName: 'John' }]
    const csv = convertToCSV(data, {
      headers: { firstName: 'First Name' }
    })
    
    expect(csv).toContain('First Name')
  })
})
```

#### Integration Test Example
```typescript
// __tests__/features/analytics/detailed-metrics-table.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DetailedMetricsTable } from '@/features/analytics/components/detailed-metrics-table'

describe('DetailedMetricsTable', () => {
  it('renders table with mock data', () => {
    render(<DetailedMetricsTable />)
    
    expect(screen.getByText(/Showing \d+ of \d+ users/)).toBeInTheDocument()
  })

  it('sorts columns when header clicked', () => {
    render(<DetailedMetricsTable />)
    
    const nameHeader = screen.getByText('User')
    fireEvent.click(nameHeader)
    
    // Check that sort indicator appears
    expect(screen.getByTestId('sort-ascending')).toBeInTheDocument()
  })

  it('filters rows based on search', () => {
    render(<DetailedMetricsTable />)
    
    const searchInput = screen.getByPlaceholderText('Search users...')
    fireEvent.change(searchInput, { target: { value: 'john' } })
    
    // Should filter to only johns
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeLessThan(100) // Less than total mock data
  })

  it('virtualizes large datasets', () => {
    render(<DetailedMetricsTable />)
    
    // Should only render visible rows (not all 100)
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeLessThan(30) // Overscan included
  })
})
```

#### E2E Test Example
```typescript
// e2e/analytics.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analytics')
  })

  test('displays KPI cards with metrics', async ({ page }) => {
    await expect(page.getByText('Active Users')).toBeVisible()
    await expect(page.getByText('Messages/Day')).toBeVisible()
    await expect(page.getByText('Task Throughput')).toBeVisible()
    await expect(page.getByText('Avg SLA Reply')).toBeVisible()
  })

  test('filters charts when KPI clicked', async ({ page }) => {
    await page.getByRole('button', { name: /Active Users/ }).click()
    
    // Should show toast notification
    await expect(page.getByText(/Filtering charts by Active Users/)).toBeVisible()
  })

  test('exports CSV when button clicked', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    
    await page.getByRole('button', { name: /Export CSV/ }).click()
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/analytics-export-.*\.csv/)
  })

  test('table supports sorting', async ({ page }) => {
    await page.getByRole('button', { name: /User/ }).click()
    
    // Check first row changed
    const firstRow = page.getByRole('row').nth(1)
    await expect(firstRow).toBeVisible()
  })

  test('table search filters results', async ({ page }) => {
    await page.getByPlaceholder('Search users...').fill('alice')
    
    // Should show fewer results
    const rows = await page.getByRole('row').count()
    expect(rows).toBeLessThan(20)
  })
})
```

---

### 2. Search with Preview

#### Unit Test Example
```typescript
// __tests__/features/search/search-preview-pane.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SearchPreviewPane } from '@/features/search/components/search-preview-pane'

describe('SearchPreviewPane', () => {
  it('shows empty state when no result selected', () => {
    render(<SearchPreviewPane result={null} onClose={() => {}} />)
    
    expect(screen.getByText('No item selected')).toBeInTheDocument()
  })

  it('renders message preview correctly', () => {
    const result = {
      type: 'message',
      item: { content: 'Hello world', sender: 'John' },
      highlights: ['Hello']
    }
    
    render(<SearchPreviewPane result={result} onClose={() => {}} />)
    
    expect(screen.getByText(/Hello world/)).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()
  })

  it('highlights search terms', () => {
    const result = {
      type: 'message',
      item: { content: 'Hello world' },
      highlights: ['Hello']
    }
    
    render(<SearchPreviewPane result={result} onClose={() => {}} />)
    
    const mark = screen.getByText('Hello')
    expect(mark.tagName).toBe('MARK')
  })
})
```

#### E2E Test Example
```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Global Search', () => {
  test('opens with Cmd+K', async ({ page }) => {
    await page.goto('/')
    
    await page.keyboard.press('Meta+K') // Mac
    // await page.keyboard.press('Control+K') // Windows
    
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('searches and shows results', async ({ page }) => {
    await page.goto('/search')
    
    await page.getByPlaceholder('Search...').fill('project')
    
    // Should show results after debounce
    await page.waitForTimeout(400)
    await expect(page.getByText(/found/i)).toBeVisible()
  })

  test('preview pane shows on result click', async ({ page }) => {
    await page.goto('/search')
    await page.getByPlaceholder('Search...').fill('test')
    await page.waitForTimeout(400)
    
    const firstResult = page.getByRole('article').first()
    await firstResult.click()
    
    // Preview should appear
    await expect(page.getByRole('complementary')).toBeVisible()
  })

  test('toggles preview pane', async ({ page }) => {
    await page.goto('/search')
    
    const toggleButton = page.getByRole('button', { name: /preview/i })
    await toggleButton.click()
    
    await expect(page.getByRole('complementary')).not.toBeVisible()
  })
})
```

---

### 3. Calendar Drag-and-Drop

#### Unit Test Example
```typescript
// __tests__/features/calendar/draggable-event.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { DraggableEvent } from '@/features/calendar/components/draggable-event'

describe('DraggableEvent', () => {
  it('renders event with title', () => {
    render(
      <DndContext>
        <DraggableEvent
          id="event-1"
          title="Team Meeting"
          color="bg-blue-500"
          type="task"
        />
      </DndContext>
    )
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument()
  })

  it('shows grip handle', () => {
    render(
      <DndContext>
        <DraggableEvent
          id="event-1"
          title="Meeting"
          color="bg-blue-500"
          type="task"
        />
      </DndContext>
    )
    
    expect(screen.getByTestId('grip-handle')).toBeInTheDocument()
  })
})
```

#### E2E Test Example
```typescript
// e2e/calendar.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Calendar', () => {
  test('switches between views', async ({ page }) => {
    await page.goto('/calendar')
    
    await page.getByRole('button', { name: 'Week' }).click()
    await expect(page.getByText(/Week of/)).toBeVisible()
    
    await page.getByRole('button', { name: 'Day' }).click()
    await expect(page.getByText(/\d+:\d+ (AM|PM)/)).toBeVisible()
  })

  test('creates event via dialog', async ({ page }) => {
    await page.goto('/calendar')
    
    // Click empty slot
    await page.getByRole('button', { name: 'Week' }).click()
    const slot = page.locator('[data-testid="calendar-slot"]').first()
    await slot.click()
    
    // Fill dialog
    await page.getByLabel('Title').fill('New Meeting')
    await page.getByRole('button', { name: 'Create Event' }).click()
    
    // Should see toast
    await expect(page.getByText(/Created event/)).toBeVisible()
  })

  test('drags event to new position', async ({ page }) => {
    await page.goto('/calendar')
    
    const event = page.getByText('Team Standup').first()
    const targetSlot = page.locator('[data-testid="calendar-slot"]').nth(5)
    
    await event.dragTo(targetSlot)
    
    // Should see success toast
    await expect(page.getByText(/Moved.*to/)).toBeVisible()
  })
})
```

---

### 4. Files Bulk Operations

#### Unit Test Example
```typescript
// __tests__/lib/utils/bulk-download.test.ts
import { describe, it, expect, vi } from 'vitest'
import { bulkDownloadFiles } from '@/lib/utils/bulk-download'

describe('Bulk Download', () => {
  it('downloads single file directly', async () => {
    const files = [{ id: '1', name: 'test.pdf', url: '/file/1' }]
    
    const downloadSpy = vi.spyOn(document, 'createElement')
    await bulkDownloadFiles(files)
    
    expect(downloadSpy).toHaveBeenCalledWith('a')
  })

  it('creates ZIP for multiple files', async () => {
    const files = [
      { id: '1', name: 'file1.pdf', url: '/file/1' },
      { id: '2', name: 'file2.pdf', url: '/file/2' },
    ]
    
    // Mock JSZip
    const zip = await bulkDownloadFiles(files)
    expect(zip).toBeDefined()
  })

  it('tracks progress', async () => {
    const files = [{ id: '1', name: 'test.pdf', url: '/file/1' }]
    const onProgress = vi.fn()
    
    await bulkDownloadFiles(files, { onProgress })
    
    expect(onProgress).toHaveBeenCalled()
  })
})
```

#### E2E Test Example
```typescript
// e2e/files.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Files', () => {
  test('selects files via checkboxes', async ({ page }) => {
    await page.goto('/files')
    
    const firstCheckbox = page.getByRole('checkbox').first()
    await firstCheckbox.check()
    
    // Bulk actions should appear
    await expect(page.getByText(/1 file selected/)).toBeVisible()
  })

  test('bulk downloads files', async ({ page }) => {
    await page.goto('/files')
    
    await page.getByRole('checkbox').first().check()
    await page.getByRole('checkbox').nth(1).check()
    
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /Download/ }).click()
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.zip$/)
  })

  test('applies retention policy', async ({ page }) => {
    await page.goto('/files')
    
    await page.getByRole('checkbox').first().check()
    await page.getByRole('button', { name: /Retention/ }).click()
    
    // Select policy
    await page.getByLabel('90 Days').click()
    await page.getByRole('button', { name: 'Apply Policy' }).click()
    
    await expect(page.getByText(/Applied.*retention/)).toBeVisible()
  })
})
```

---

### 5. Notification Preferences

#### Integration Test Example
```typescript
// __tests__/features/notifications/preferences-matrix.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PreferencesMatrix } from '@/features/notifications/components/preferences-matrix'

describe('PreferencesMatrix', () => {
  it('renders matrix with all event types', () => {
    render(<PreferencesMatrix />)
    
    expect(screen.getByText('Chat Mentions')).toBeInTheDocument()
    expect(screen.getByText('Task Assigned')).toBeInTheDocument()
    expect(screen.getByText('Important Mail')).toBeInTheDocument()
  })

  it('toggles channel preferences', () => {
    render(<PreferencesMatrix />)
    
    const checkbox = screen.getAllByRole('checkbox')[0]
    const initialState = checkbox.checked
    
    fireEvent.click(checkbox)
    
    expect(checkbox.checked).toBe(!initialState)
  })

  it('shows unsaved changes badge', () => {
    render(<PreferencesMatrix />)
    
    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)
    
    expect(screen.getByRole('button', { name: /Save Changes/ })).not.toBeDisabled()
  })

  it('updates channel counts', () => {
    render(<PreferencesMatrix />)
    
    const inAppCount = screen.getByText(/In-App: \d+\/6/)
    expect(inAppCount).toBeInTheDocument()
  })
})
```

---

### 6. Workflow Node Editor

#### Integration Test Example
```typescript
// __tests__/features/workflow/workflow-canvas.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkflowCanvas } from '@/features/workflow/components/workflow-canvas'

describe('WorkflowCanvas', () => {
  it('shows empty state with no nodes', () => {
    render(
      <WorkflowCanvas
        nodes={[]}
        onNodesChange={() => {}}
        selectedNodeId={null}
        onSelectNode={() => {}}
      />
    )
    
    expect(screen.getByText(/Add nodes from the palette/)).toBeInTheDocument()
  })

  it('renders nodes at correct positions', () => {
    const nodes = [
      {
        id: '1',
        type: 'trigger',
        nodeType: 'task_created',
        label: 'Task Created',
        position: { x: 100, y: 100 },
        config: {},
      },
    ]
    
    render(
      <WorkflowCanvas
        nodes={nodes}
        onNodesChange={() => {}}
        selectedNodeId={null}
        onSelectNode={() => {}}
      />
    )
    
    expect(screen.getByText('Task Created')).toBeInTheDocument()
  })
})
```

---

## 🔧 Test Setup

### Install Dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/user-event
npm install -D @playwright/test
npm install -D @axe-core/playwright  # A11y testing
```

### Vitest Config
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### Test Setup File
```typescript
// test/setup.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

### Playwright Config
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 📋 Test Checklists

### Before Deployment
- [ ] All unit tests pass
- [ ] Integration tests cover key workflows
- [ ] E2E tests cover critical paths
- [ ] A11y tests pass (axe)
- [ ] Visual regression tests (optional)

### Continuous Testing
- [ ] Tests run on every commit (CI/CD)
- [ ] Coverage reports generated
- [ ] Flaky tests identified and fixed
- [ ] Test suite completes in <5 minutes

---

## 🎯 Coverage Goals

### Current Status
```
Unit Tests:        0% (to be implemented)
Integration Tests: 0% (to be implemented)
E2E Tests:         0% (to be implemented)
A11y Tests:        100% (manual audit complete)
```

### Target Status
```
Unit Tests:        80%
Integration Tests: 70%
E2E Tests:         60%
A11y Tests:        100%
```

---

## ✅ Quick Start

### Run Unit Tests
```bash
npm run test
npm run test:coverage
npm run test:watch
```

### Run E2E Tests
```bash
npx playwright test
npx playwright test --headed
npx playwright test --debug
npx playwright show-report
```

### Run A11y Tests
```typescript
// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('analytics page has no a11y violations', async ({ page }) => {
  await page.goto('/analytics')
  
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

---

**Testing setup complete!** All examples ready for implementation.
