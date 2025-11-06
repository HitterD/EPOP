# Advanced Analytics Dashboard

## Overview

The Analytics Dashboard provides comprehensive KPI tracking, trend visualization, and performance metrics across the organization. It enables data-driven decision-making with real-time insights and historical analysis.

## Features

### Wave-1 (✅ COMPLETE)
- **Dashboard Shell**: Complete layout with header, filters, and tab navigation
- **KPI Cards**: 4 primary metrics with trend indicators (Active Users, Messages/Day, Task Throughput, Avg SLA Reply)
- **Filters Panel**: Date range picker, Organization Unit selector, Project filter
- **Drill-down Capability**: Click KPI cards to filter charts and tables
- **CSV Export**: Export button for raw data download
- **Tab Navigation**: Overview, User Activity, Messages, Tasks

### Wave-2 (Planned)
- **Chart Integration**: recharts/visx components for Line, Bar, Area, Histogram charts
- **Virtualized Table**: TanStack Table with sorting, filtering, pagination
- **Lazy Loading**: Dynamic chart loading to optimize bundle size
- **Real-time Updates**: WebSocket integration for live metrics

## File Locations

```
app/(shell)/analytics/page.tsx    # Main dashboard page
```

## Usage

### Basic Navigation

Access the dashboard at `/analytics`. The page loads with default filters (current month, all units, all projects).

### Filtering Data

1. **Date Range**: Click the date range picker to select a custom period
2. **Organization Unit**: Select a specific department or team
3. **Project**: Filter by a specific project

All charts and tables update automatically when filters change.

### KPI Drill-down

Click any KPI card to activate drill-down mode. This filters all visualizations to focus on that specific metric.

Example:
- Click "Active Users" → Charts show user activity trends
- Click "Messages/Day" → Charts show message volume patterns

### Exporting Data

Click the "Export CSV" button in the header to download current filtered data. The export includes:
- All visible metrics
- Applied filter parameters
- Timestamp of export

## Backend Contract Requests

### Required Endpoints

#### 1. Summary Analytics
```
GET /api/v1/analytics/summary
Query Params:
  - startDate: ISO 8601 date
  - endDate: ISO 8601 date
  - orgUnitId?: string
  - projectId?: string

Response:
{
  activeUsers: { value: number, change: number },
  messagesPerDay: { value: number, change: number },
  taskThroughput: { value: number, change: number },
  avgSLAReply: { value: string, change: number }
}
```

#### 2. Time Series Data
```
GET /api/v1/analytics/timeseries
Query Params:
  - metric: 'users' | 'messages' | 'tasks' | 'sla'
  - startDate: ISO 8601 date
  - endDate: ISO 8601 date
  - interval: 'hour' | 'day' | 'week' | 'month'
  - orgUnitId?: string
  - projectId?: string

Response:
{
  series: Array<{
    timestamp: string,
    value: number
  }>
}
```

#### 3. Detail Table Data
```
GET /api/v1/analytics/details
Query Params:
  - metric?: string (for drill-down)
  - startDate: ISO 8601 date
  - endDate: ISO 8601 date
  - orgUnitId?: string
  - projectId?: string
  - page: number
  - pageSize: number

Response:
{
  items: Array<{
    userId: string,
    userName: string,
    messageCount: number,
    taskCount: number,
    avgResponseTime: number,
    lastActive: string
  }>,
  total: number,
  page: number,
  pageSize: number
}
```

#### 4. Export Data
```
POST /api/v1/analytics/export
Body:
{
  format: 'csv' | 'xlsx',
  filters: {
    startDate: string,
    endDate: string,
    orgUnitId?: string,
    projectId?: string
  }
}

Response:
{
  downloadUrl: string,
  expiresAt: string
}
```

## Component Architecture

### KPICard Component
Reusable card component for displaying key metrics with trend indicators.

Props:
- `title`: Metric name
- `value`: Current value (string or number)
- `change`: Percentage change vs previous period
- `icon`: React icon component
- `onClick`: Optional drill-down handler

### Filter State Management

Filters are managed using React state with `useMemo` for derived data:

```typescript
const filters = useMemo(() => ({
  startDate: dateRange?.from,
  endDate: dateRange?.to,
  orgUnitId: selectedOrgUnit !== 'all' ? selectedOrgUnit : undefined,
  projectId: selectedProject !== 'all' ? selectedProject : undefined
}), [dateRange, selectedOrgUnit, selectedProject])
```

## Performance Considerations

### Wave-2 Optimizations
- **Chart Lazy Loading**: Use dynamic imports to reduce initial bundle
- **Table Virtualization**: Render only visible rows for large datasets
- **Debounced Filters**: Prevent excessive API calls on rapid filter changes
- **Memoized Calculations**: Cache expensive computations

## Accessibility

- All KPI cards are keyboard navigable
- Date pickers follow WCAG 2.1 AA guidelines
- Charts will include ARIA labels and data tables (Wave-2)
- Export functionality announces completion to screen readers

## Testing

### Unit Tests (TODO)
- Filter state management
- KPI drill-down logic
- CSV export data formatting

### E2E Tests (TODO)
```typescript
// Playwright test example
test('Analytics dashboard filters work', async ({ page }) => {
  await page.goto('/analytics')
  await page.click('[data-testid="date-range-picker"]')
  await page.click('[data-testid="last-7-days"]')
  await expect(page.locator('.kpi-card')).toContainText(/\d+/)
})
```

## Future Enhancements

### Wave-3+
- Real-time dashboard updates via WebSocket
- Custom metric builder
- Scheduled report emails
- Dashboard templates (Executive, Team Lead, Individual)
- Comparative analysis (YoY, QoQ)
- Predictive analytics using ML models

## Related Documentation

- [Performance Guidelines](./performance.md)
- [TanStack Table Integration](./virtualization.md)
- [Chart Library Comparison](./DESIGN_SYSTEM.md)
