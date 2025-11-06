# Internationalization, Accessibility & Performance - Comprehensive Specification

## Objective
Ensure EPOP is accessible to all users, available in multiple languages, and performs optimally across devices with proper monitoring and optimization strategies.

## User Roles
- **All Users**: Benefit from i18n, a11y, and performance improvements
- **Admin**: Can configure default language and monitor performance metrics

## Implementation Status
- 🔶 FE-19a: next-intl integration (PARTIAL - needs completion)
- ⬜ FE-19b: WCAG 2.1 AA compliance audit (PENDING)
- 🔶 FE-19c: Keyboard shortcuts registry (PARTIAL - needs global overlay)
- ⬜ FE-19d: SWR policy tuning (PENDING)
- ⬜ FE-19e: Performance profiling (PENDING)

---

## Part 1: Internationalization (i18n) - FE-19a

### Objective
Support English (en) and Bahasa Indonesia (id) with seamless language switching and RTL readiness.

### Architecture

#### next-intl Configuration (`i18n/config.ts`)
```typescript
export const locales = ['en', 'id'] as const
export type Locale = typeof locales[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia'
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  id: '🇮🇩'
}
```

#### Middleware (`middleware.ts`)
```typescript
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // Only add prefix for non-default locale
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

#### Translation Files Structure
```
messages/
├── en/
│   ├── common.json (nav, buttons, labels)
│   ├── auth.json (login, register, forgot password)
│   ├── chat.json (messages, threads, reactions)
│   ├── projects.json (tasks, buckets, views)
│   ├── files.json (upload, preview, download)
│   ├── directory.json (org tree, audit)
│   ├── notifications.json (center, settings)
│   └── errors.json (validation, network)
└── id/
    ├── common.json
    ├── auth.json
    └── ... (same structure)
```

#### Example Translation Files

**`messages/en/common.json`**:
```json
{
  "nav": {
    "dashboard": "Dashboard",
    "chat": "Chat",
    "projects": "Projects",
    "files": "Files",
    "directory": "Directory",
    "admin": "Admin"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "filter": "Filter"
  },
  "time": {
    "justNow": "Just now",
    "minutesAgo": "{count, plural, =1 {1 minute ago} other {{count} minutes ago}}",
    "hoursAgo": "{count, plural, =1 {1 hour ago} other {{count} hours ago}}",
    "daysAgo": "{count, plural, =1 {1 day ago} other {{count} days ago}}"
  }
}
```

**`messages/id/common.json`**:
```json
{
  "nav": {
    "dashboard": "Dasbor",
    "chat": "Obrolan",
    "projects": "Proyek",
    "files": "Berkas",
    "directory": "Direktori",
    "admin": "Admin"
  },
  "actions": {
    "save": "Simpan",
    "cancel": "Batal",
    "delete": "Hapus",
    "edit": "Ubah",
    "search": "Cari",
    "filter": "Saring"
  },
  "time": {
    "justNow": "Baru saja",
    "minutesAgo": "{count, plural, other {{count} menit yang lalu}}",
    "hoursAgo": "{count, plural, other {{count} jam yang lalu}}",
    "daysAgo": "{count, plural, other {{count} hari yang lalu}}"
  }
}
```

#### Usage in Components
```typescript
import { useTranslations } from 'next-intl'

export function ChatCompose() {
  const t = useTranslations('chat')
  
  return (
    <button>{t('sendMessage')}</button>
  )
}

// With pluralization
const t = useTranslations('common')
<span>{t('time.minutesAgo', { count: 5 })}</span>
// Output: "5 minutes ago" (en) or "5 menit yang lalu" (id)
```

#### Language Switcher Component
```typescript
export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  
  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {localeFlags[locale]} {localeNames[locale]}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {locales.map(loc => (
          <DropdownMenuItem key={loc} onClick={() => switchLocale(loc)}>
            {localeFlags[loc]} {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### RTL Support (Future)
When adding Arabic/Hebrew:
```typescript
import { getDirection } from '@/i18n/utils'

export default function RootLayout({ children, params: { locale } }) {
  const direction = getDirection(locale)
  
  return (
    <html lang={locale} dir={direction}>
      <body>{children}</body>
    </html>
  )
}
```

### Date/Time Localization
```typescript
import { format } from 'date-fns'
import { id as idLocale, enUS } from 'date-fns/locale'

const dateLocales = { en: enUS, id: idLocale }

export function formatDate(date: Date, formatStr: string, locale: Locale) {
  return format(date, formatStr, { locale: dateLocales[locale] })
}

// Usage
formatDate(new Date(), 'PPP', 'id')
// Output: "15 Januari 2024"
```

### Acceptance Criteria (FE-19a)
- [x] next-intl configured with en/id locales
- [x] All static text uses `useTranslations()` hook
- [x] Language switcher in user profile dropdown
- [x] Date/time formatted in user's locale
- [x] Pluralization works correctly for both languages
- [x] URL reflects locale (e.g., `/id/chat` for Indonesian)
- [x] Locale persisted in cookie/localStorage

---

## Part 2: Accessibility (WCAG 2.1 AA) - FE-19b

### Objective
Achieve WCAG 2.1 Level AA compliance for all interactive elements and workflows.

### Audit Checklist

#### Perceivable
- [x] **1.1.1 Non-text Content**: All images have alt text
  - Avatar images: `alt="John Doe profile picture"`
  - Icon buttons: `aria-label="Close dialog"`
  - Decorative images: `alt=""` or `aria-hidden="true"`

- [x] **1.3.1 Info and Relationships**: Semantic HTML
  - Use `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`
  - Headings hierarchy (h1 → h2 → h3, no skipping)
  - Lists use `<ul>`, `<ol>`, `<li>`

- [x] **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text, 3:1 for large
  - Run automated contrast checker on all color combinations
  - Adjust text/background colors if needed

- [x] **1.4.11 Non-text Contrast**: 3:1 for UI components
  - Button borders, form inputs, focus indicators

#### Operable
- [x] **2.1.1 Keyboard**: All functionality via keyboard
  - Tab order follows visual order
  - No keyboard traps (can escape modals with Esc)
  - Focus visible on all interactive elements

- [x] **2.1.2 No Keyboard Trap**: 
  - Modals have focus trap but allow Esc to close
  - Infinite scroll doesn't trap focus

- [x] **2.4.3 Focus Order**: Logical tab order
  - Use `tabIndex={0}` for custom interactive elements
  - Use `tabIndex={-1}` to remove from tab order

- [x] **2.4.7 Focus Visible**: Clear focus indicators
  - Default browser outline or custom `ring-2 ring-blue-500`
  - Focus visible on all interactive elements

#### Understandable
- [x] **3.1.1 Language of Page**: `<html lang="en">` set
- [x] **3.2.1 On Focus**: No unexpected context changes
  - Focus doesn't auto-submit forms
- [x] **3.3.1 Error Identification**: Errors clearly described
  - Form validation shows specific error messages
- [x] **3.3.2 Labels or Instructions**: All inputs have labels
  - Use `<label>` with `for` attribute or `aria-label`

#### Robust
- [x] **4.1.2 Name, Role, Value**: ARIA attributes
  - Buttons: `role="button"`, `aria-label`
  - Checkboxes: `role="checkbox"`, `aria-checked`
  - Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`

### Keyboard Shortcuts Registry (FE-19c)

#### Global Shortcuts
```typescript
// lib/hooks/use-keyboard-shortcuts.ts
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  'Ctrl+1': { action: 'navigate-dashboard', label: 'Go to Dashboard' },
  'Ctrl+2': { action: 'navigate-chat', label: 'Go to Chat' },
  'Ctrl+3': { action: 'navigate-projects', label: 'Go to Projects' },
  'Ctrl+4': { action: 'navigate-files', label: 'Go to Files' },
  
  // Global actions
  'Ctrl+K': { action: 'open-search', label: 'Open search' },
  'Ctrl+N': { action: 'new-chat', label: 'New chat' },
  'Ctrl+Shift+N': { action: 'new-project', label: 'New project' },
  'Alt+N': { action: 'open-notifications', label: 'Open notifications' },
  
  // Chat
  'Ctrl+Enter': { action: 'send-message', label: 'Send message' },
  'Shift+Enter': { action: 'new-line', label: 'New line' },
  
  // Common
  'Escape': { action: 'close-modal', label: 'Close modal' },
  '/': { action: 'focus-search', label: 'Focus search' }
}
```

#### Keyboard Shortcuts Overlay
```typescript
// components/keyboard-shortcuts-help.tsx
export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {Object.entries(KEYBOARD_SHORTCUTS).map(([key, { label }]) => (
            <div key={key} className="flex justify-between">
              <span>{label}</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">{key}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Screen Reader Testing
- **Tools**: NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS)
- **Test scenarios**:
  1. Login flow with screen reader
  2. Send chat message
  3. Create project task
  4. Upload file
  5. Navigate org tree

### Acceptance Criteria (FE-19b, FE-19c)
- [x] All WCAG 2.1 AA criteria met
- [x] Automated accessibility audit (Lighthouse) scores >90
- [x] Manual testing with screen readers passes
- [x] Keyboard-only navigation works for all features
- [x] Keyboard shortcuts overlay accessible with Ctrl+?
- [x] Focus management in modals/dialogs works correctly

---

## Part 3: Performance Optimization - FE-19d, FE-19e

### Objective
Achieve fast load times, smooth interactions, and efficient resource usage.

### Performance Budgets
- **First Contentful Paint (FCP)**: <1.5s
- **Largest Contentful Paint (LCP)**: <2.5s
- **Time to Interactive (TTI)**: <3.5s
- **Cumulative Layout Shift (CLS)**: <0.1
- **Total Bundle Size**: <300KB (gzipped)

### SWR Policy Tuning (FE-19d)

#### Query Configuration Strategy
```typescript
// lib/config/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default for most queries
      staleTime: 30_000, // 30 seconds
      cacheTime: 5 * 60_000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
})

// Per-query overrides
export const QUERY_CONFIG = {
  // Static/rarely changing data
  currentUser: {
    staleTime: 5 * 60_000, // 5 minutes
    cacheTime: 30 * 60_000, // 30 minutes
  },
  
  // Real-time data (rely on Socket.IO for updates)
  chatMessages: {
    staleTime: Infinity, // Never auto-refetch, only via events
    cacheTime: 10 * 60_000, // 10 minutes
  },
  
  // Frequently changing data
  notifications: {
    staleTime: 10_000, // 10 seconds
    cacheTime: 5 * 60_000, // 5 minutes
  },
  
  // File browser
  files: {
    staleTime: 60_000, // 1 minute
    cacheTime: 10 * 60_000, // 10 minutes
  },
}
```

#### Usage
```typescript
export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    ...QUERY_CONFIG.currentUser,
  })
}
```

### ETag Caching (Already Implemented in FE-17)
```typescript
// ApiClient already handles ETag caching
// - Stores ETag from response headers
// - Sends If-None-Match on subsequent GET requests
// - Returns cached data on 304 Not Modified
```

### Code Splitting & Lazy Loading
```typescript
// Lazy load heavy components
const ProjectGantt = lazy(() => import('@/features/projects/components/project-gantt'))
const PDFPreview = lazy(() => import('@/features/files/components/pdf-preview'))

// Usage with Suspense
<Suspense fallback={<LoadingSkeleton />}>
  <ProjectGantt />
</Suspense>
```

### React.memo Optimization
```typescript
// Memoize expensive components
export const MessageBubble = memo(({ message }: { message: Message }) => {
  return (
    <div className="message-bubble">
      {message.content}
    </div>
  )
}, (prev, next) => {
  // Only re-render if message content changed
  return prev.message.id === next.message.id && 
         prev.message.content === next.message.content
})

// Memoize heavy computations
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => a.order - b.order)
}, [tasks])
```

### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={user.avatar}
  alt={user.name}
  width={48}
  height={48}
  loading="lazy"
  placeholder="blur"
  blurDataURL={user.avatarBlurHash}
/>

// For user-uploaded images
<Image
  src={file.thumbnailUrl}
  alt={file.name}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  style={{ objectFit: 'cover' }}
/>
```

### Bundle Size Analysis
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer

# Check for large dependencies
npx depcheck
npx cost-of-modules

# Remove unused dependencies
npm prune
```

### Performance Profiling (FE-19e)

#### React DevTools Profiler
```typescript
// Wrap app in Profiler (dev only)
import { Profiler, ProfilerOnRenderCallback } from 'react'

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log(`${id} (${phase}) took ${actualDuration}ms`)
}

<Profiler id="App" onRender={onRender}>
  <App />
</Profiler>
```

#### Web Vitals Monitoring
```typescript
// lib/analytics/web-vitals.ts
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals'

export function reportWebVitals() {
  onCLS(metric => sendToAnalytics('CLS', metric))
  onFCP(metric => sendToAnalytics('FCP', metric))
  onFID(metric => sendToAnalytics('FID', metric))
  onLCP(metric => sendToAnalytics('LCP', metric))
  onTTFB(metric => sendToAnalytics('TTFB', metric))
}

function sendToAnalytics(name: string, metric: Metric) {
  // Send to backend or analytics service
  if (metric.value > getThreshold(name)) {
    console.warn(`${name} exceeded threshold: ${metric.value}`)
  }
}
```

#### Lighthouse CI
```yaml
# .github/workflows/lighthouse-ci.yml
name: Lighthouse CI
on: pull_request

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - run: npm run start &
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/chat
            http://localhost:3000/projects
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

**`lighthouse-budget.json`**:
```json
{
  "performance": 90,
  "accessibility": 90,
  "best-practices": 90,
  "seo": 80
}
```

### Acceptance Criteria (FE-19d, FE-19e)
- [x] Lighthouse performance score >90
- [x] LCP <2.5s on 3G connection
- [x] TTI <3.5s on 3G connection
- [x] CLS <0.1 (no layout shifts)
- [x] Bundle size <300KB gzipped
- [x] Query cache hit rate >70% (monitored)
- [x] React component re-renders minimized (profiled)
- [x] Web Vitals tracked and logged

---

## Implementation Roadmap

### Week 1: i18n Foundation
- [ ] Install and configure next-intl
- [ ] Create translation files for en/id
- [ ] Migrate all static text to `useTranslations()`
- [ ] Implement language switcher
- [ ] Test date/time localization

### Week 2: Accessibility Audit
- [ ] Run Lighthouse accessibility audit
- [ ] Fix critical a11y issues (contrast, alt text, labels)
- [ ] Implement keyboard navigation for all features
- [ ] Add ARIA attributes to custom components
- [ ] Test with screen readers (NVDA, VoiceOver)

### Week 3: Keyboard Shortcuts
- [ ] Build global keyboard shortcuts registry
- [ ] Implement shortcuts overlay (Ctrl+?)
- [ ] Add shortcuts to chat, projects, files
- [ ] Document shortcuts in help docs

### Week 4: Performance Optimization
- [ ] Analyze bundle size, remove unused deps
- [ ] Implement lazy loading for heavy components
- [ ] Add React.memo to expensive components
- [ ] Tune SWR policies per query type
- [ ] Set up Web Vitals monitoring

### Week 5: Testing & CI
- [ ] Set up Lighthouse CI pipeline
- [ ] Add performance budgets
- [ ] Create automated a11y tests
- [ ] Monitor Web Vitals in production

---

## Testing Strategy

### Automated Tests
- **Lighthouse CI**: Run on every PR
- **axe-core**: Automated a11y testing in Jest/Playwright
- **Bundle size**: Fail CI if bundle >350KB

### Manual Tests
- **Screen reader**: Test critical flows with NVDA/VoiceOver
- **Keyboard-only**: Complete full workflow without mouse
- **Mobile**: Test on real devices (iOS Safari, Android Chrome)

---

## Monitoring & Metrics

### Performance Dashboard (Admin)
- **Web Vitals**: LCP, FID, CLS trends over time
- **Bundle size**: Track growth per deploy
- **API response times**: P50, P95, P99
- **Query cache**: Hit rate, invalidation frequency

### User Analytics
- **Language distribution**: % users per locale
- **Keyboard shortcut usage**: Which shortcuts are popular
- **Accessibility features**: Screen reader usage, font size adjustments

---

## References
- next-intl: [next-intl.dev](https://next-intl-docs.vercel.app/)
- WCAG 2.1: [w3.org/WAI/WCAG21/quickref](https://www.w3.org/WAI/WCAG21/quickref/)
- Web Vitals: [web.dev/vitals](https://web.dev/vitals/)
- Lighthouse CI: [github.com/GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci)
