# Web Vitals Endpoint - Backend Contract

**Status:** 📋 Contract Specification (Backend Implementation Required)  
**Priority:** P2  
**Estimated Effort:** 4h Backend

---

## Overview

Frontend akan mengirim Core Web Vitals metrics ke backend untuk monitoring performa real users (RUM - Real User Monitoring).

---

## Endpoint Specification

### POST /api/v1/vitals

**Purpose:** Receive Web Vitals metrics from frontend

**Authentication:** Optional (can be anonymous for public pages, authenticated for logged-in users)

**Rate Limiting:** 10 requests per second per IP (prevent abuse)

---

## Request

### Headers

```
Content-Type: application/json
Authorization: Bearer <token> (optional)
```

### Body Schema

```typescript
interface VitalsPayload {
  // Metric identification
  name: string  // 'CLS' | 'FID' | 'INP' | 'LCP' | 'FCP' | 'TTFB' | 'custom.*'
  value: number // Metric value in ms (or unitless for CLS)
  rating: 'good' | 'needs-improvement' | 'poor'
  
  // Metric metadata
  delta: number // Change since last report
  id: string    // Unique metric ID
  navigationType: string // 'navigate' | 'reload' | 'back-forward' | 'prerender'
  
  // Context
  url: string   // Page URL where metric was collected
  timestamp: string // ISO 8601 timestamp
  userAgent: string // Browser user agent
  
  // Optional custom metadata
  metadata?: Record<string, any>
}
```

### Example Request

```json
{
  "name": "LCP",
  "value": 1823.5,
  "rating": "good",
  "delta": 1823.5,
  "id": "v3-1699264789123-4567890123456",
  "navigationType": "navigate",
  "url": "https://epop.com/projects/123",
  "timestamp": "2025-11-06T08:45:23.456Z",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
}
```

---

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Metric recorded"
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid payload",
  "details": "Field 'value' must be a positive number"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to store metric"
}
```

---

## Backend Implementation Guidelines

### Database Schema

**Recommended Table: `web_vitals`**

```sql
CREATE TABLE web_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metric data
  metric_name VARCHAR(50) NOT NULL,
  metric_value DECIMAL(10, 2) NOT NULL,
  rating VARCHAR(20) NOT NULL,
  delta DECIMAL(10, 2),
  metric_id VARCHAR(100),
  navigation_type VARCHAR(20),
  
  -- Context
  url TEXT NOT NULL,
  user_agent TEXT,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_web_vitals_metric_name (metric_name),
  INDEX idx_web_vitals_created_at (created_at),
  INDEX idx_web_vitals_user_id (user_id),
  INDEX idx_web_vitals_url (url),
  INDEX idx_web_vitals_rating (rating)
);
```

### Data Retention

**Recommended:**
- Keep raw data for 30 days
- Aggregate daily for 1 year
- Aggregate monthly for 3 years

**Aggregation Query Example:**
```sql
CREATE TABLE web_vitals_daily AS
SELECT 
  DATE(created_at) as date,
  metric_name,
  rating,
  COUNT(*) as count,
  AVG(metric_value) as avg_value,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95
FROM web_vitals
GROUP BY DATE(created_at), metric_name, rating;
```

### Processing Pipeline

**Option 1: Synchronous (Simple)**
```typescript
@Post('/api/v1/vitals')
async recordVitals(@Body() payload: VitalsPayload, @Req() req) {
  // Validate payload
  if (!payload.name || !payload.value) {
    throw new BadRequestException('Invalid payload')
  }
  
  // Extract user ID from token (if authenticated)
  const userId = req.user?.id || null
  
  // Store in database
  await this.vitalsRepository.create({
    userId,
    metricName: payload.name,
    metricValue: payload.value,
    rating: payload.rating,
    delta: payload.delta,
    metricId: payload.id,
    navigationType: payload.navigationType,
    url: payload.url,
    userAgent: payload.userAgent,
    metadata: payload.metadata,
  })
  
  return { success: true, message: 'Metric recorded' }
}
```

**Option 2: Asynchronous (Scalable)**
```typescript
@Post('/api/v1/vitals')
async recordVitals(@Body() payload: VitalsPayload) {
  // Push to message queue (Redis, RabbitMQ, etc.)
  await this.queue.add('process-vitals', payload)
  
  // Return immediately (don't wait for processing)
  return { success: true, message: 'Metric queued' }
}

// Worker process
@Process('process-vitals')
async processVitals(job: Job<VitalsPayload>) {
  const payload = job.data
  
  // Batch insert for better performance
  await this.vitalsRepository.bulkCreate([payload])
  
  // Optional: Trigger alerts if metrics are poor
  if (payload.rating === 'poor') {
    await this.alertService.sendAlert(`Poor ${payload.name}: ${payload.value}`)
  }
}
```

---

## Analytics Queries

### P75 LCP by Day (Last 30 days)

```sql
SELECT 
  DATE(created_at) as date,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75_lcp
FROM web_vitals
WHERE metric_name = 'LCP' 
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Rating Distribution

```sql
SELECT 
  metric_name,
  rating,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY metric_name), 2) as percentage
FROM web_vitals
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY metric_name, rating
ORDER BY metric_name, rating;
```

### Slowest Pages (by P95 LCP)

```sql
SELECT 
  url,
  COUNT(*) as page_views,
  ROUND(AVG(metric_value), 2) as avg_lcp,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value), 2) as p95_lcp
FROM web_vitals
WHERE metric_name = 'LCP'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY url
HAVING COUNT(*) >= 10
ORDER BY p95_lcp DESC
LIMIT 10;
```

---

## Monitoring & Alerts

### Recommended Alerts

**Critical:**
- P75 LCP > 4s for any route (more than 1 hour)
- P75 INP > 500ms for any route (more than 1 hour)
- Error rate > 5% when reporting vitals

**Warning:**
- P75 LCP > 2.5s for popular routes
- P75 CLS > 0.1 for any route
- Increasing trend in poor ratings (>20% poor)

### Dashboard Metrics

**Key Metrics to Display:**
1. **Core Web Vitals Score:** % of users with all good ratings
2. **LCP Trend:** P75 LCP over time
3. **INP Trend:** P75 INP over time
4. **CLS Trend:** P75 CLS over time
5. **Page Performance:** Slowest pages by LCP
6. **Browser Breakdown:** Metrics by browser
7. **Device Breakdown:** Metrics by device type

---

## Security Considerations

**Input Validation:**
```typescript
class VitalsPayloadDto {
  @IsString()
  @IsIn(['CLS', 'FID', 'INP', 'LCP', 'FCP', 'TTFB'])
  name: string

  @IsNumber()
  @Min(0)
  @Max(60000) // 60 seconds max
  value: number

  @IsString()
  @IsIn(['good', 'needs-improvement', 'poor'])
  rating: string

  @IsUrl()
  @MaxLength(2000)
  url: string

  @IsString()
  @MaxLength(500)
  userAgent: string
}
```

**Rate Limiting:**
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 1) // 10 requests per second
@Post('/api/v1/vitals')
async recordVitals() { ... }
```

**CORS:**
```typescript
// Allow from your domain only
app.enableCors({
  origin: ['https://epop.com', 'https://app.epop.com'],
  methods: ['POST'],
  credentials: false,
})
```

---

## Testing

### Unit Test Example

```typescript
describe('VitalsController', () => {
  it('should record valid vitals', async () => {
    const payload = {
      name: 'LCP',
      value: 1500,
      rating: 'good',
      delta: 1500,
      id: 'test-123',
      navigationType: 'navigate',
      url: 'https://epop.com/test',
      timestamp: new Date().toISOString(),
      userAgent: 'test-agent',
    }

    const result = await controller.recordVitals(payload)
    expect(result.success).toBe(true)
  })

  it('should reject invalid payload', async () => {
    const payload = { name: 'INVALID', value: -1 }
    await expect(controller.recordVitals(payload)).rejects.toThrow()
  })
})
```

### Load Test

```bash
# Using Apache Bench
ab -n 1000 -c 10 -p vitals.json -T application/json \
   http://localhost:3000/api/v1/vitals

# Expected: <100ms average response time
```

---

## Deployment Checklist

**Backend:**
- [ ] Create database table
- [ ] Implement POST endpoint
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Set up aggregation job
- [ ] Configure monitoring alerts

**Infrastructure:**
- [ ] Set up database indexes
- [ ] Configure CDN caching (if needed)
- [ ] Set up log aggregation
- [ ] Create dashboard in monitoring tool

**Testing:**
- [ ] Unit tests passing
- [ ] Load testing completed
- [ ] Security audit done
- [ ] GDPR compliance verified

---

## Frontend Integration

**Installation:**
```bash
npm install web-vitals
```

**Usage:**
```typescript
// Already implemented in:
// - lib/monitoring/web-vitals.ts
// - components/monitoring/web-vitals-reporter.tsx
// - components/providers/providers.tsx
```

**Verification:**
```bash
# In browser console
window.performance.getEntriesByType('navigation')
window.performance.getEntriesByType('paint')

# Network tab: Filter for /api/v1/vitals
# Should see POST requests with metrics
```

---

## References

- [Web Vitals](https://web.dev/vitals/)
- [web-vitals npm package](https://www.npmjs.com/package/web-vitals)
- [Chrome User Experience Report](https://developers.google.com/web/tools/chrome-user-experience-report)

---

**Status:** ⏳ Awaiting Backend Implementation  
**Estimated Effort:** 4h Backend  
**Frontend:** ✅ Ready (implementation complete)

