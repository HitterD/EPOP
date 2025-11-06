# Frontend Observability Guide

**Status:** ✅ Wave-4 Implementation Complete (Frontend)  
**Last Updated:** 2025-11-06  
**Backend Dependency:** Web Vitals endpoint (see `docs/backend/VITALS_ENDPOINT_CONTRACT.md`)

---

## Overview

Comprehensive observability stack untuk monitoring frontend performance, errors, dan user experience di production.

---

## 1. Web Vitals Monitoring (FE-Obs-1)

###

 Implementation

**Files:**
- `lib/monitoring/web-vitals.ts` - Core Web Vitals collection
- `components/monitoring/web-vitals-reporter.tsx` - React component
- `components/providers/providers.tsx` - Integration

### Core Web Vitals Tracked

| Metric | Description | Good | Needs Improvement | Poor |
|--------|-------------|------|-------------------|------|
| **LCP** | Largest Contentful Paint | ≤2.5s | ≤4s | >4s |
| **FID** | First Input Delay (deprecated) | ≤100ms | ≤300ms | >300ms |
| **INP** | Interaction to Next Paint (new) | ≤200ms | ≤500ms | >500ms |
| **CLS** | Cumulative Layout Shift | ≤0.1 | ≤0.25 | >0.25 |
| **FCP** | First Contentful Paint | ≤1.8s | ≤3s | >3s |
| **TTFB** | Time to First Byte | ≤800ms | ≤1.8s | >1.8s |

### Data Collection

**Automatic:**
```typescript
// Auto-initialized in Providers
import { WebVitalsReporter } from '@/components/monitoring/web-vitals-reporter'

<WebVitalsReporter />
```

**Manual Custom Metrics:**
```typescript
import { reportCustomMetric, markPerformance, measurePerformance } from '@/lib/monitoring/web-vitals'

// Mark a point in time
markPerformance('data-fetch-start')

// ... do something ...

markPerformance('data-fetch-end')

// Measure duration
measurePerformance('data-fetch', 'data-fetch-start', 'data-fetch-end')

// Or report directly
reportCustomMetric('api.response.time', 350, {
  endpoint: '/api/projects',
  method: 'GET',
})
```

### Data Sent to Backend

**Endpoint:** `POST /api/v1/vitals`

**Payload:**
```typescript
{
  name: 'LCP',
  value: 1823.5,
  rating: 'good',
  delta: 1823.5,
  id: 'v3-1699264789123-4567890123456',
  navigationType: 'navigate',
  url: 'https://epop.com/projects/123',
  timestamp: '2025-11-06T08:45:23.456Z',
  userAgent: 'Mozilla/5.0...'
}
```

**Reliability:**
- Uses `navigator.sendBeacon()` for reliability
- Falls back to `fetch()` with `keepalive: true`
- Works even when page is closing
- Silently fails (doesn't impact UX)

---

## 2. Error Tracking

### ErrorBoundary

**Already Implemented:** `components/system/ErrorBoundary.tsx`

**Features:**
- Catches React rendering errors
- Retry mechanism (max 3 attempts)
- Reports to `window.__reportError`
- Developer mode: Shows stack traces
- Production: User-friendly messages

**Integration:**
```typescript
<ErrorBoundary 
  name="ChatSection"
  maxRetries={3}
  onError={(error, info) => {
    // Custom error handler
    console.error('Chat failed:', error)
  }}
>
  <ChatComponent />
</ErrorBoundary>
```

**Error Reporting:**
```typescript
// ErrorBoundary automatically calls this
window.__reportError({
  name: 'ErrorBoundary:ChatSection',
  error: error.message,
  stack: error.stack,
  componentStack: info.componentStack,
  timestamp: new Date().toISOString(),
})
```

### Global Error Handler

**Add to app/layout.tsx:**
```typescript
useEffect(() => {
  const handleError = (event: ErrorEvent) => {
    window.__reportError?.({
      name: 'GlobalError',
      error: event.message,
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString(),
    })
  }

  const handleRejection = (event: PromiseRejectionEvent) => {
    window.__reportError?.({
      name: 'UnhandledRejection',
      error: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
    })
  }

  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', handleRejection)

  return () => {
    window.removeEventListener('error', handleError)
    window.removeEventListener('unhandledrejection', handleRejection)
  }
}, [])
```

---

## 3. Self-Hosted Monitoring (FE-Obs-2)

### Option A: Sentry Self-Hosted

**Why Sentry:**
- ✅ Full control over data
- ✅ Source maps support
- ✅ User context tracking
- ✅ Release tracking
- ✅ Performance monitoring

**Installation:**
```bash
npm install @sentry/nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Self-hosted URL
  tunnel: 'https://sentry.your-domain.com/tunnel',
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Sample rate
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Integrations
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'epop.com'],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Replay sample rate
  replaysSessionSampleRate: 0.01, // 1%
  replaysOnErrorSampleRate: 1.0,   // 100% on errors
  
  // Before send (filter sensitive data)
  beforeSend(event, hint) {
    // Don't send if in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization']
      delete event.request.headers['Cookie']
    }
    
    return event
  },
})
```

**Usage:**
```typescript
import * as Sentry from '@sentry/nextjs'

// Capture exception
try {
  // code that might throw
} catch (error) {
  Sentry.captureException(error, {
    level: 'error',
    tags: { section: 'chat' },
    extra: { chatId: '123' },
  })
}

// Add user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
})

// Add breadcrumb
Sentry.addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
})
```

### Option B: OpenReplay Self-Hosted

**Why OpenReplay:**
- ✅ Session replay
- ✅ DevTools timeline
- ✅ Network logs
- ✅ Console logs
- ✅ User actions

**Installation:**
```bash
npm install @openreplay/tracker
```

**Configuration:**
```typescript
// lib/monitoring/openreplay.ts
import Tracker from '@openreplay/tracker'

const tracker = new Tracker({
  projectKey: process.env.NEXT_PUBLIC_OPENREPLAY_KEY!,
  ingestPoint: 'https://openreplay.your-domain.com/ingest',
  
  // Privacy
  obscureTextEmails: true,
  obscureTextNumbers: true,
  obscureInputEmails: true,
  
  // Performance
  capturePerformance: true,
  
  // Network
  network: {
    capturePayload: false, // Don't capture request/response bodies
    sessionTokenHeader: 'Authorization',
    ignoreHeaders: ['Authorization', 'Cookie'],
  },
})

tracker.start()

export default tracker
```

**Usage:**
```typescript
import tracker from '@/lib/monitoring/openreplay'

// Set user ID
tracker.setUserID(user.id)

// Custom event
tracker.event('task_created', {
  projectId: '123',
  taskId: '456',
})

// Issue tracking
tracker.issue('Button not working', {
  severity: 'high',
})
```

---

## 4. Performance Monitoring

### TanStack Query DevTools

**Already Enabled:** Development mode only

**Access:** Bottom-left corner in dev mode

**Features:**
- Query cache inspection
- Mutation tracking
- Refetch triggers
- Stale/fresh status

### React DevTools Profiler

**Usage:**
```bash
# Install React DevTools extension
# Open DevTools > Profiler tab
# Click "Start Profiling"
# Interact with app
# Click "Stop Profiling"
# Review flame graph
```

### Lighthouse CI

**Already Configured:** `lighthouserc.json`

**Run:**
```bash
npm run ci:lighthouse
```

**Metrics Tracked:**
- Performance score ≥85%
- LCP ≤2.5s
- CLS ≤0.1
- INP ≤200ms
- Accessibility ≥95%

---

## 5. User Behavior Analytics

### Event Tracking

**Custom Events:**
```typescript
// lib/monitoring/analytics.ts
export function trackEvent(
  name: string,
  properties?: Record<string, any>
) {
  // Send to your analytics backend
  fetch('/api/v1/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: name,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    }),
  }).catch(() => {
    // Silently fail
  })
  
  // Also send to monitoring tool
  if (window.__reportMetric) {
    window.__reportMetric({
      name: `event.${name}`,
      properties,
    })
  }
}
```

**Usage:**
```typescript
import { trackEvent } from '@/lib/monitoring/analytics'

// Track user actions
trackEvent('task.created', {
  projectId: '123',
  status: 'todo',
})

trackEvent('message.sent', {
  chatId: '456',
  hasAttachment: true,
})

trackEvent('file.uploaded', {
  fileType: 'pdf',
  fileSize: 1024000,
})
```

---

## 6. Real-Time Monitoring Dashboard

### Metrics to Display

**Performance:**
- P75 LCP by route
- P75 INP by route
- P75 CLS by route
- Bundle size over time

**Errors:**
- Error rate (errors per 1000 requests)
- Top errors by frequency
- Errors by route
- Errors by browser

**User Activity:**
- Active users (last 5 min)
- Page views by route
- Session duration
- Bounce rate

### Example Query (PostgreSQL)

```sql
-- P75 LCP by route (last 24h)
SELECT 
  url,
  COUNT(*) as samples,
  ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value), 2) as p75_lcp,
  ROUND(AVG(metric_value), 2) as avg_lcp
FROM web_vitals
WHERE metric_name = 'LCP'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY url
ORDER BY p75_lcp DESC
LIMIT 10;
```

---

## 7. Alerting

### Alert Rules

**Critical:**
```yaml
- name: High Error Rate
  condition: error_rate > 5%
  duration: 5m
  severity: critical
  notify: ['oncall', 'slack']

- name: Poor LCP
  condition: p75_lcp > 4000ms
  duration: 15m
  severity: critical
  notify: ['oncall']
```

**Warning:**
```yaml
- name: Increasing LCP
  condition: p75_lcp > 2500ms
  duration: 30m
  severity: warning
  notify: ['slack']

- name: High CLS
  condition: p75_cls > 0.1
  duration: 30m
  severity: warning
  notify: ['slack']
```

---

## 8. Installation Checklist

### Dependencies

```bash
# Required
npm install web-vitals

# Optional (choose one)
npm install @sentry/nextjs          # Sentry
npm install @openreplay/tracker     # OpenReplay
```

### Backend

- [ ] Implement POST /api/v1/vitals endpoint
- [ ] Create database table for metrics
- [ ] Set up aggregation job
- [ ] Create monitoring dashboard
- [ ] Configure alerts

### Frontend

- [x] Web Vitals collection (implemented)
- [x] Error boundaries (implemented)
- [x] Integration in providers (implemented)
- [ ] Install web-vitals package
- [ ] Choose monitoring tool (Sentry/OpenReplay)
- [ ] Configure error reporting

---

## 9. Testing Observability

### Verify Web Vitals

```bash
# Open browser DevTools console
# Navigate to a page
# Check Network tab for POST /api/v1/vitals requests

# Should see requests with metrics like:
# { name: "LCP", value: 1500, rating: "good", ... }
```

### Trigger Test Error

```typescript
// In any component (dev mode)
<button onClick={() => {
  throw new Error('Test error for monitoring')
}}>
  Trigger Error
</button>

// Should see:
// 1. ErrorBoundary catches it
// 2. Error logged to console (dev mode)
// 3. Error sent to monitoring tool
```

### Simulate Poor Performance

```typescript
// Slow down network in DevTools
// Throttle to "Slow 3G"
// Reload page
// Check Web Vitals (should see "poor" ratings)
```

---

## 10. Best Practices

### Do's ✅

- **Sample rates:** Use 10-20% for performance, 100% for errors
- **Privacy:** Mask sensitive data before sending
- **Rate limiting:** Implement on backend to prevent abuse
- **Graceful degradation:** Monitoring failures shouldn't break app
- **Retention:** Keep raw data 30 days, aggregates 1 year

### Don'ts ❌

- **Don't block:** Never make monitoring synchronous
- **Don't log PII:** No passwords, tokens, emails in logs
- **Don't spam:** Rate limit client-side and server-side
- **Don't alert fatigue:** Set proper thresholds
- **Don't store forever:** Clean up old data

---

## 11. Troubleshooting

### Web Vitals Not Sending

**Check:**
1. Is web-vitals package installed?
2. Is WebVitalsReporter rendered?
3. Is backend endpoint responding?
4. Check browser console for errors
5. Check Network tab for failed requests

**Fix:**
```bash
npm install web-vitals
# Restart dev server
```

### High Error Rate in Production

**Steps:**
1. Check Sentry/OpenReplay dashboard
2. Identify top errors
3. Check browser/device breakdown
4. Review recent deployments
5. Rollback if necessary

### Missing Metrics

**Common Causes:**
- Ad blockers blocking requests
- CORS issues
- Backend endpoint down
- Rate limiting activated

---

## References

- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals](https://web.dev/articles/vitals)
- [Sentry Docs](https://docs.sentry.io/)
- [OpenReplay Docs](https://docs.openreplay.com/)

---

**Status:** ✅ Frontend Implementation Complete  
**Next:** Backend endpoint implementation (4h effort)

