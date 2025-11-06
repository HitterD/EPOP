# 🚀 Frontend Implementation Execution Guide

**Principal Product Designer + Staff Frontend Architect**  
**Last Updated**: 5 November 2025, 1:15 PM

---

## 📋 Quick Start

### Current Status
- **Wave-1**: ✅ 100% Complete (Infrastructure)
- **Wave-2**: ✅ 95% Complete (Chat/Files/Compose)
- **Wave-3**: 🔶 85% Complete (Projects/Search/Directory)
- **Wave-4**: 🔶 30% Complete (Notifications/i18n/A11y)
- **Wave-5**: ⬜ 0% Complete (Design System/Testing)

**Overall**: 78% → Target: 100%

---

## 🎯 Next Sprint: Wave-3 P1 Tasks (2 weeks)

### Task 1: FE-14b - Audit Trail Viewer
**Branch**: `feat/fe-14b-audit-viewer`  
**Estimate**: 8 hours  
**Priority**: P1

#### Step-by-Step Implementation

**1. Create Component Structure** (2h)
```bash
# Create files
mkdir -p features/directory/components
touch features/directory/components/audit-trail-viewer.tsx
touch features/directory/components/audit-event-row.tsx
touch features/directory/components/audit-filters.tsx
```

**Files to create**:
- `features/directory/components/audit-trail-viewer.tsx`
- `features/directory/components/audit-event-row.tsx`
- `features/directory/components/audit-filters.tsx`
- `lib/api/hooks/use-audit-trail.ts`

**2. Implement Hook** (2h)
```typescript
// lib/api/hooks/use-audit-trail.ts
import { useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '../client'
import { AuditEvent, CursorPaginatedResponse } from '@/types'

export function useAuditTrail(
  contextType: 'org_unit' | 'user' | 'global',
  contextId?: string,
  filters?: AuditFilters
) {
  return useInfiniteQuery({
    queryKey: ['audit', contextType, contextId, filters],
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.get<CursorPaginatedResponse<AuditEvent>>(
        `/directory/audit`,
        {
          params: {
            contextType,
            contextId,
            limit: 20,
            cursor: pageParam,
            ...filters,
          },
        }
      )
      return response.data
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  })
}
```

**3. Build UI Components** (3h)
- AuditTrailViewer (main container)
- AuditEventRow (individual event)
- AuditFilters (date range, action type, user)

**4. Testing & Polish** (1h)
- Test with >100 events
- Test real-time updates
- Test CSV export
- Test filters

#### Acceptance Criteria Checklist
- [ ] Shows audit events with timestamp, actor, action, target, details
- [ ] Filters by date range (last 7, 30 days, custom)
- [ ] Filters by action type (move, create, delete, update)
- [ ] Filters by user
- [ ] Exports to CSV
- [ ] Real-time updates via `directory.audit.created`
- [ ] Cursor pagination works smoothly
- [ ] Loading skeleton shows while fetching
- [ ] Empty state shows when no events

#### PR Checklist
- [ ] Code follows style guide
- [ ] TypeScript strict passes
- [ ] Dark mode tested
- [ ] Mobile responsive
- [ ] Documentation updated
- [ ] `EPop_Status.md` marked ✅

---

### Task 2: FE-14c - Bulk Import Dry-Run UI
**Branch**: `feat/fe-14c-bulk-import`  
**Estimate**: 12 hours  
**Priority**: P1

#### Step-by-Step Implementation

**1. Create Wizard Structure** (3h)
```typescript
// Multi-step wizard pattern
interface WizardStep {
  id: 'upload' | 'mapping' | 'preview' | 'import' | 'result'
  title: string
  component: React.ComponentType
}

const steps: WizardStep[] = [
  { id: 'upload', title: 'Upload CSV', component: UploadStep },
  { id: 'mapping', title: 'Map Columns', component: MappingStep },
  { id: 'preview', title: 'Preview', component: PreviewStep },
  { id: 'import', title: 'Import', component: ImportStep },
  { id: 'result', title: 'Results', component: ResultStep },
]
```

**Files to create**:
- `features/admin/components/bulk-import-wizard.tsx`
- `features/admin/components/bulk-import-upload-step.tsx`
- `features/admin/components/bulk-import-mapping-step.tsx`
- `features/admin/components/bulk-import-preview-step.tsx`
- `features/admin/components/bulk-import-result-step.tsx`
- `features/admin/components/bulk-import-preview-table.tsx`
- `lib/api/hooks/use-bulk-import.ts`

**2. Implement Upload Step** (2h)
- File upload with validation (CSV only, max 5MB)
- Parse CSV headers
- Show file info (name, size, row count)

**3. Implement Mapping Step** (2h)
- Auto-detect column mapping
- Allow manual mapping if auto-detect fails
- Show preview of first 5 rows

**4. Implement Preview Step** (3h)
- Call dry-run endpoint
- Show validation results in table
- Highlight invalid rows
- Show error messages per row
- Allow in-place editing of invalid rows

**5. Implement Import & Result Steps** (2h)
- Show progress bar during import
- Poll for status updates
- Show success summary
- Provide download link for import log

#### Acceptance Criteria Checklist
- [ ] Accepts CSV files (max 5MB), rejects others
- [ ] Auto-detects column headers
- [ ] Allows manual column mapping
- [ ] Shows dry-run preview with errors highlighted
- [ ] Displays row-level validation errors
- [ ] Allows editing invalid rows before import
- [ ] Shows real-time progress during import
- [ ] Provides download link for import log
- [ ] "Download template" button works
- [ ] "Export errors as CSV" works

---

### Task 3: FE-12c - Charts View (Analytics)
**Branch**: `feat/fe-12c-charts-view`  
**Estimate**: 12 hours  
**Priority**: P1

#### Step-by-Step Implementation

**1. Create Charts Container** (2h)
```typescript
// features/projects/components/project-charts-view.tsx
export function ProjectChartsView({ projectId }: Props) {
  const [chartType, setChartType] = useState<ChartType>('burndown')
  const [dateRange, setDateRange] = useState<DateRange>(last30Days)
  
  const { data: analytics } = useProjectAnalytics(projectId, dateRange)
  
  return (
    <div>
      <ChartSelector value={chartType} onChange={setChartType} />
      <DateRangeFilter value={dateRange} onChange={setDateRange} />
      
      {chartType === 'burndown' && <BurndownChart data={analytics} />}
      {chartType === 'progress' && <ProgressChart data={analytics} />}
      {chartType === 'workload' && <WorkloadChart data={analytics} />}
      {chartType === 'timeline' && <TimelineChart data={analytics} />}
    </div>
  )
}
```

**2. Implement Individual Charts** (6h)
- **BurndownChart** (2h): Line chart with ideal vs actual
- **ProgressChart** (1h): Pie chart with status breakdown
- **WorkloadChart** (2h): Bar chart per assignee
- **TimelineChart** (1h): Line chart for velocity

**3. Add Interactivity** (2h)
- Tooltips on hover
- Export to PNG/PDF
- Legend toggle
- Responsive resize

**4. Testing & Polish** (2h)
- Test with various data sets
- Test empty states
- Test date range filters
- Test export functionality

#### Acceptance Criteria Checklist
- [ ] Displays 4 chart types (burndown, progress, workload, timeline)
- [ ] Chart selector dropdown works
- [ ] Date range filter works (7, 30, 90 days, custom)
- [ ] Tooltips show on hover
- [ ] Export to PNG/PDF works
- [ ] Charts are responsive
- [ ] Loading skeleton shows while fetching
- [ ] Empty state shows if no data
- [ ] Legend toggle works

---

## 🛠️ Development Workflow

### Daily Routine

**Morning** (9:00 AM):
1. Check EPop_Status.md for current task
2. Create branch: `git checkout -b feat/fe-xxx`
3. Read task acceptance criteria
4. Review API contracts (if needed, submit contract request)

**Development** (9:30 AM - 12:00 PM):
1. Implement core functionality
2. Add loading/error/empty states
3. Test manually in browser
4. Fix TypeScript errors

**Lunch** (12:00 PM - 1:00 PM)

**Testing** (1:00 PM - 3:00 PM):
1. Test all acceptance criteria
2. Test dark mode
3. Test mobile responsive
4. Test keyboard navigation
5. Record demo video (Loom)

**Documentation** (3:00 PM - 4:00 PM):
1. Update component documentation
2. Update EPop_Status.md
3. Fill out PR template
4. Commit and push

**Review** (4:00 PM - 5:00 PM):
1. Self-review checklist
2. Create PR
3. Request review from team
4. Address feedback if immediate

---

## 📝 Component Development Template

### 1. Create Component File
```typescript
'use client'

import { useState } from 'react'
import { ComponentProps } from '@/types'

interface YourComponentProps {
  // Define props
}

export function YourComponent({ }: YourComponentProps) {
  // State
  const [state, setState] = useState()
  
  // API hooks
  const { data, isLoading, error } = useYourHook()
  
  // Handlers
  const handleAction = async () => {
    // Implementation
  }
  
  // Loading state
  if (isLoading) {
    return <Skeleton />
  }
  
  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />
  }
  
  // Empty state
  if (!data || data.length === 0) {
    return <EmptyState />
  }
  
  // Main render
  return (
    <div>
      {/* Component UI */}
    </div>
  )
}
```

### 2. Create API Hook
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export function useYourEntity(id: string) {
  return useQuery({
    queryKey: ['entity', id],
    queryFn: async () => {
      const response = await apiClient.get(`/endpoint/${id}`)
      return response.data
    },
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateEntity(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateData) => {
      const response = await apiClient.patch(`/endpoint/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', id] })
    },
  })
}
```

### 3. Add Types
```typescript
// types/index.ts
export interface YourEntity {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface UpdateYourEntity {
  name?: string
}
```

---

## 🧪 Testing Checklist

### Manual Testing (Required for all tasks)

**Functionality**:
- [ ] Happy path works
- [ ] Error handling works
- [ ] Edge cases handled (empty data, network error)
- [ ] Optimistic updates work
- [ ] Real-time updates work (if applicable)

**UI/UX**:
- [ ] Loading state shows skeleton
- [ ] Error state shows error message + retry button
- [ ] Empty state shows illustration + CTA
- [ ] Dark mode works
- [ ] Mobile responsive (375px, 768px, 1920px)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Tooltips helpful

**Performance**:
- [ ] No unnecessary re-renders (check React DevTools Profiler)
- [ ] Images optimized (use next/image)
- [ ] Large lists virtualized (if >100 items)
- [ ] Modals lazy loaded

---

## 📚 Resources & References

### Documentation
- **EPop_Status.md**: Current status and task tracker
- **WAVE_3_4_5_TASKS.md**: Detailed task breakdowns
- **PR_WORKFLOW.md**: PR template and guidelines
- **docs/frontend/*.md**: UI/UX specifications per feature

### Code Examples
- **OptimisticMessageList**: Optimistic updates with rollback
- **BoardView**: Drag-and-drop with @dnd-kit
- **GlobalSearchDialog**: Debounced search with filters
- **NotificationBell**: Real-time updates via Socket.IO

### External Libraries
- **SVAR Grid**: https://docs.svar.dev/grid/
- **SVAR Gantt**: https://docs.svar.dev/gantt/
- **Recharts**: https://recharts.org/
- **next-intl**: https://next-intl-docs.vercel.app/
- **@dnd-kit**: https://docs.dndkit.com/

---

## 🚨 Common Issues & Solutions

### Issue: TypeScript errors in existing message-bubble.tsx
**Solution**: Use `MessageBubbleEnhanced` instead. The old `message-bubble.tsx` has errors and should be deprecated.

### Issue: Avatar component prop mismatch
**Solution**: Import from `@/components/ui/avatar-wrapper` instead of `@/components/ui/avatar`.

### Issue: Socket.IO not connecting
**Solution**: Verify `NEXT_PUBLIC_WS_URL` in `.env.local` and ensure backend is running.

### Issue: Real-time updates not working
**Solution**: 
1. Check Socket.IO connection in Network tab
2. Ensure event name matches backend (e.g., `chat.message.created`)
3. Verify `useDomainEvents` hook is called
4. Check query invalidation in mutation onSuccess

### Issue: Optimistic update doesn't rollback on error
**Solution**:
1. Use `useMutation` with `onMutate`, `onError`, `onSettled`
2. Save snapshot in `onMutate`
3. Restore snapshot in `onError`
4. Example: See `OptimisticMessageList` implementation

---

## 🎯 Success Metrics

### Definition of Done
A task is **DONE** when:
- [ ] All acceptance criteria met
- [ ] Manual testing complete
- [ ] Documentation updated
- [ ] PR merged
- [ ] EPop_Status.md marked ✅
- [ ] No console errors
- [ ] Works in staging

### Quality Checklist
- [ ] TypeScript strict: 0 errors
- [ ] ESLint warnings: 0
- [ ] Lighthouse Performance: >90
- [ ] Lighthouse Accessibility: >95
- [ ] Bundle size increase: <50KB
- [ ] No memory leaks

---

**Ready to start?** Pick FE-14b as the next task and follow this guide!

**Questions?** Check PR_WORKFLOW.md or existing component implementations.

**Good luck! 🚀**
