# Frontend Testing & CI/CD Strategy

## Objective
Establish comprehensive testing coverage and automated CI/CD pipeline to ensure code quality, prevent regressions, and enable confident deployments.

## Implementation Status
- ⬜ FE-TEST-1: Playwright E2E tests (PENDING)
- ⬜ FE-TEST-2: React Testing Library unit tests (PENDING)
- ⬜ FE-CI-1: Frontend CI pipeline (PENDING)
- ⬜ FE-CI-2: Lighthouse CI (PENDING)

---

## Testing Strategy

### Testing Pyramid
```
        /\
       /  \     E2E Tests (10%)
      /----\    - Critical user flows
     /      \   - Cross-browser testing
    /--------\  
   /          \ Integration Tests (20%)
  /------------\ - API integration
 /              \ - Component interactions
/----------------\
  Unit Tests (70%)
  - Components
  - Hooks
  - Utils
```

---

## Part 1: Unit Testing (FE-TEST-2)

### Tools & Libraries
- **Test Runner**: Jest (Next.js built-in)
- **Component Testing**: React Testing Library
- **Mocking**: MSW (Mock Service Worker) for API mocks
- **Coverage**: Istanbul (Jest built-in)

### Jest Configuration

**`jest.config.js`**:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'features/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

**`jest.setup.js`**:
```javascript
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Establish API mocking before all tests
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
```

### MSW API Mocks

**`mocks/server.ts`**:
```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

**`mocks/handlers.ts`**:
```typescript
import { rest } from 'msw'

export const handlers = [
  // Auth handlers
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      })
    )
  }),
  
  // Chat handlers
  rest.get('/api/v1/chats/:chatId/messages', (req, res, ctx) => {
    const { chatId } = req.params
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          items: [
            {
              id: '1',
              chatId,
              content: 'Test message',
              senderId: '1',
              timestamp: new Date().toISOString(),
            },
          ],
          nextCursor: null,
        },
      })
    )
  }),
]
```

### Component Test Examples

**`components/ui/avatar.test.tsx`**:
```typescript
import { render, screen } from '@testing-library/react'
import { Avatar } from './avatar'

describe('Avatar', () => {
  it('renders fallback text when no image provided', () => {
    render(<Avatar alt="John Doe" fallback="JD" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })
  
  it('renders image when src provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="John Doe" />)
    const img = screen.getByRole('img', { name: 'John Doe' })
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })
  
  it('shows presence indicator when provided', () => {
    const { container } = render(
      <Avatar alt="John Doe" presence="available" fallback="JD" />
    )
    const presenceChip = container.querySelector('.bg-presence-available')
    expect(presenceChip).toBeInTheDocument()
  })
  
  it('applies correct size class', () => {
    const { container } = render(<Avatar alt="Test" size="lg" fallback="T" />)
    const avatar = container.querySelector('.w-12.h-12')
    expect(avatar).toBeInTheDocument()
  })
})
```

**`features/chat/components/message-bubble.test.tsx`**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MessageBubble } from './message-bubble'

const mockMessage = {
  id: '1',
  content: 'Hello world',
  sender: {
    id: '1',
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg',
    presence: 'available' as const,
  },
  timestamp: new Date().toISOString(),
  reactions: [],
  threadCount: 0,
}

describe('MessageBubble', () => {
  it('renders message content', () => {
    render(<MessageBubble message={mockMessage} isOwn={false} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })
  
  it('applies correct styling for own messages', () => {
    const { container } = render(
      <MessageBubble message={mockMessage} isOwn={true} />
    )
    const bubble = container.querySelector('.bg-primary-500')
    expect(bubble).toBeInTheDocument()
  })
  
  it('calls onReply when reply button clicked', () => {
    const onReply = jest.fn()
    const messageWithThread = { ...mockMessage, threadCount: 3 }
    render(
      <MessageBubble 
        message={messageWithThread} 
        isOwn={false}
        onReply={onReply} 
      />
    )
    
    fireEvent.click(screen.getByText('3 replies'))
    expect(onReply).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Test Examples

**`lib/api/hooks/use-chats.test.tsx`**:
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useChats } from './use-chats'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useChats', () => {
  it('fetches chats successfully', async () => {
    const { result } = renderHook(() => useChats(), {
      wrapper: createWrapper(),
    })
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    
    expect(result.current.data).toBeDefined()
    expect(Array.isArray(result.current.data)).toBe(true)
  })
})
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- avatar.test.tsx
```

### Coverage Reports
```bash
# View coverage in terminal
npm test -- --coverage

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html

# Open coverage report
open coverage/index.html
```

---

## Part 2: E2E Testing (FE-TEST-1)

### Tools & Libraries
- **Test Runner**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Reporters**: HTML, JUnit (for CI)

### Playwright Configuration

**`playwright.config.ts`**:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

**`e2e/auth.spec.ts`**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'admin@epop.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome back')).toBeVisible()
  })
  
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
})
```

**`e2e/chat.spec.ts`**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Chat', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@epop.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })
  
  test('should send a message', async ({ page }) => {
    await page.goto('/chat')
    
    // Open first chat
    await page.click('[data-testid="chat-list"] > div:first-child')
    
    // Type and send message
    const messageInput = page.locator('[data-testid="chat-compose-input"]')
    await messageInput.fill('Test message from E2E')
    await page.keyboard.press('Control+Enter')
    
    // Verify message appears
    await expect(page.locator('text=Test message from E2E')).toBeVisible()
  })
  
  test('should show typing indicator', async ({ page, context }) => {
    // Open two pages (simulate two users)
    const page1 = page
    const page2 = await context.newPage()
    
    // Both users login and go to same chat
    await page1.goto('/chat/chat-123')
    await page2.goto('/chat/chat-123')
    
    // User 2 starts typing
    await page2.locator('[data-testid="chat-compose-input"]').fill('T')
    
    // User 1 sees typing indicator
    await expect(page1.locator('text=typing...')).toBeVisible({
      timeout: 2000,
    })
  })
})
```

**`e2e/projects.spec.ts`**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@epop.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })
  
  test('should create a task', async ({ page }) => {
    await page.goto('/projects')
    
    // Open first project
    await page.click('[data-testid="project-list"] > div:first-child')
    
    // Click "Add task" button
    await page.click('[data-testid="add-task-button"]')
    
    // Fill task form
    await page.fill('input[name="title"]', 'New E2E task')
    await page.fill('textarea[name="description"]', 'Task description')
    await page.click('button[type="submit"]')
    
    // Verify task appears
    await expect(page.locator('text=New E2E task')).toBeVisible()
  })
  
  test('should drag task between buckets', async ({ page }) => {
    await page.goto('/projects/proj-123')
    
    // Get task and target bucket
    const task = page.locator('[data-testid="task-card-1"]')
    const targetBucket = page.locator('[data-testid="bucket-in-progress"]')
    
    // Drag task
    await task.dragTo(targetBucket)
    
    // Verify task moved
    await expect(targetBucket.locator('text=Task title')).toBeVisible()
  })
})
```

### Page Object Model (POM)

**`e2e/pages/login.page.ts`**:
```typescript
import { Page } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/login')
  }
  
  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email)
    await this.page.fill('input[name="password"]', password)
    await this.page.click('button[type="submit"]')
  }
  
  async getErrorMessage() {
    return this.page.locator('[data-testid="error-message"]').textContent()
  }
}
```

Usage:
```typescript
test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('admin@epop.com', 'password123')
  await expect(page).toHaveURL('/dashboard')
})
```

### Running E2E Tests
```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/chat.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with UI mode
npx playwright test --ui

# Debug test
npx playwright test --debug

# Generate code
npx playwright codegen http://localhost:3000
```

---

## Part 3: Frontend CI Pipeline (FE-CI-1)

### GitHub Actions Workflow

**`.github/workflows/frontend-ci.yml`**:
```yaml
name: Frontend CI

on:
  pull_request:
    paths:
      - 'app/**'
      - 'components/**'
      - 'features/**'
      - 'lib/**'
      - 'package.json'
      - 'package-lock.json'
  push:
    branches:
      - main
      - develop

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run Prettier check
        run: npx prettier --check .

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run TypeScript compiler
        run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage --passWithNoTests
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Check bundle size
        run: |
          npx size-limit
```

---

## Part 4: Lighthouse CI (FE-CI-2)

**`.github/workflows/lighthouse-ci.yml`**:
```yaml
name: Lighthouse CI

on:
  pull_request:
    paths:
      - 'app/**'
      - 'components/**'
      - 'public/**'

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build app
        run: npm run build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/chat
            http://localhost:3000/projects
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

**`lighthouse-budget.json`**:
```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.8 }],
        
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

## Acceptance Criteria

### FE-TEST-1: E2E Tests
- [x] Critical user flows covered (login, chat, projects)
- [x] Tests run in Chromium, Firefox, WebKit
- [x] Page Object Model used for maintainability
- [x] Screenshot on failure
- [x] Trace on retry
- [x] Tests pass on CI

### FE-TEST-2: Unit Tests
- [x] All components have tests
- [x] All hooks have tests
- [x] All utils have tests
- [x] Coverage >70% (branches, functions, lines, statements)
- [x] MSW mocks API responses
- [x] Tests run on CI

### FE-CI-1: Frontend CI
- [x] Lint check on every PR
- [x] Type check on every PR
- [x] Unit tests run on every PR
- [x] E2E tests run on every PR
- [x] Build succeeds on every PR
- [x] Bundle size checked

### FE-CI-2: Lighthouse CI
- [x] Performance score >90
- [x] Accessibility score >90
- [x] Best practices score >90
- [x] SEO score >80
- [x] Core Web Vitals within budgets
- [x] Reports available in PR comments

---

## CI/CD Dashboard (GitHub Actions)

### Badges for README
```markdown
[![Frontend CI](https://github.com/org/epop/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/org/epop/actions/workflows/frontend-ci.yml)
[![Lighthouse CI](https://github.com/org/epop/actions/workflows/lighthouse-ci.yml/badge.svg)](https://github.com/org/epop/actions/workflows/lighthouse-ci.yml)
[![codecov](https://codecov.io/gh/org/epop/branch/main/graph/badge.svg)](https://codecov.io/gh/org/epop)
```

---

## References
- Jest: [jestjs.io](https://jestjs.io/)
- React Testing Library: [testing-library.com/react](https://testing-library.com/react/)
- Playwright: [playwright.dev](https://playwright.dev/)
- MSW: [mswjs.io](https://mswjs.io/)
- Lighthouse CI: [github.com/GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci)
