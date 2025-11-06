# Projects Advanced Views - SVAR DataGrid, Gantt & Charts Specification

## Objective
Enhance project management with professional-grade Grid (SVAR DataGrid), Timeline (SVAR Gantt), and Analytics (Recharts) views, all synchronized in real-time via Socket.IO.

## User Roles
- **Project Owner**: Full access to all views and editing
- **Project Member**: Can view and edit assigned tasks
- **Project Viewer**: Read-only access to all views

## Implementation Status
- ✅ FE-12: Real-time sync infrastructure (Socket.IO events)
- ✅ FE-13: Timezone support + drag-reorder with rollback
- ⬜ FE-12a: SVAR DataGrid integration (PENDING)
- ⬜ FE-12b: SVAR Gantt integration (PENDING)
- ⬜ FE-12c: Charts view with Recharts (PENDING)

---

## Information Architecture

### View Tabs (within `/projects/[projectId]`)
```
┌─────────────────────────────────────────────────┐
│  [Board] [Grid] [Gantt] [Schedule] [Charts]    │
└─────────────────────────────────────────────────┘
```

### Component Hierarchy
```
ProjectViewContainer
├── ProjectHeader (name, description, members)
├── ViewTabBar
└── ViewContent (conditional render)
    ├── BoardView (existing, ✅ done)
    ├── GridView (FE-12a)
    │   └── SVARDataGrid
    │       ├── GridToolbar (filter, sort, export)
    │       ├── GridColumns (configurable)
    │       ├── GridRows (virtualized)
    │       └── GridFooter (summary stats)
    ├── GanttView (FE-12b)
    │   └── SVARGantt
    │       ├── GanttToolbar (zoom, scale, filter)
    │       ├── GanttTree (task hierarchy)
    │       ├── GanttTimeline (bars, dependencies)
    │       └── GanttControls (drag, resize, link)
    ├── ScheduleView (existing, ✅ done with react-big-calendar)
    └── ChartsView (FE-12c)
        ├── ChartSelector (dropdown: burndown, progress, workload)
        ├── BurndownChart (Recharts line chart)
        ├── ProgressChart (Recharts pie chart)
        ├── WorkloadChart (Recharts bar chart)
        └── ChartFilters (date range, assignee)
```

---

## State Model (Extension to ProjectsStore)

### Enhanced ProjectsStore (`lib/stores/projects-store.ts`)

```typescript
interface ProjectsState {
  // ... existing state
  
  // Grid view state
  gridColumns: GridColumn[]
  gridSort: { field: string; direction: 'asc' | 'desc' }[]
  gridFilters: GridFilter[]
  
  // Gantt view state
  ganttScale: 'day' | 'week' | 'month' | 'quarter'
  ganttZoom: number // 0.5 to 2.0
  ganttShowBaseline: boolean
  ganttShowCriticalPath: boolean
  
  // Charts view state
  chartType: 'burndown' | 'progress' | 'workload' | 'timeline'
  chartDateRange: { start: string; end: string }
  chartFilters: { assigneeId?: string; status?: string }
  
  // Actions
  setGridSort(sort: GridSort[]): void
  setGridFilters(filters: GridFilter[]): void
  setGanttScale(scale: GanttScale): void
  setGanttZoom(zoom: number): void
  setChartType(type: ChartType): void
}

interface GridColumn {
  id: string
  header: string
  field: keyof Task
  width: number
  editable: boolean
  type: 'text' | 'select' | 'date' | 'number' | 'multiselect'
  options?: { value: string; label: string }[] // for select types
}

interface GridFilter {
  field: string
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan'
  value: any
}
```

---

## UX Flows

### Flow 1: Use SVAR DataGrid for Inline Task Editing (FE-12a)

**Trigger**: User clicks "Grid" tab

**Steps**:
1. UI renders `SVARDataGrid` component with loading skeleton
2. **Client fetches** tasks via `useProjectTasks(projectId, 1000)` (higher limit for grid)
3. Transform tasks into grid-compatible format:
   ```typescript
   const gridData = tasks.map(task => ({
     id: task.id,
     title: task.title,
     assignees: task.assignees.map(a => a.id),
     status: task.status,
     priority: task.priority,
     dueDate: task.dueDate,
     progress: task.progress,
     bucket: task.bucketName
   }))
   ```
4. SVAR DataGrid renders with columns:
   - **Title** (text, editable, 300px)
   - **Assignees** (multiselect, editable, avatars, 200px)
   - **Status** (select, editable, color badges, 120px)
   - **Priority** (select, editable, icons, 100px)
   - **Due Date** (date picker, editable, 120px)
   - **Progress** (slider, editable, 0-100%, 100px)
   - **Bucket** (text, read-only, 150px)
5. User clicks cell → inline editor appears
6. User edits value → **Debounce 500ms** → `useUpdateTask()` mutation
7. **Optimistic update**: Grid cell updates immediately
8. **Socket.IO event**: `project:task_updated` → other clients' grids update
9. If error → rollback cell value, show error toast

**Grid Features**:
- **Sorting**: Click column header to sort (multi-column with Shift+click)
- **Filtering**: Icon in header opens filter popover (text search, range, equals)
- **Resizing**: Drag column divider to resize
- **Reordering**: Drag column header to reorder columns
- **Export**: "Export to CSV" button downloads all visible rows

**Real-Time Sync**:
```typescript
useProjectTaskEvents(projectId, true)
// Listens to:
// - project:task_created → add row to grid
// - project:task_updated → update row cells
// - project:task_deleted → remove row
// - project:task_moved → update bucket column
```

---

### Flow 2: Visualize Timeline with SVAR Gantt (FE-12b)

**Trigger**: User clicks "Gantt" tab

**Steps**:
1. UI renders `SVARGantt` component with loading skeleton
2. **Client fetches** tasks with `useProjectTasks(projectId, 1000)`
3. Transform tasks into Gantt format:
   ```typescript
   const ganttData = tasks.map(task => ({
     id: task.id,
     text: task.title,
     start_date: task.startDate || task.createdAt,
     end_date: task.dueDate,
     duration: calculateDuration(task.startDate, task.dueDate),
     progress: task.progress / 100,
     parent: task.parentTaskId || 0, // For hierarchy
     type: task.children?.length > 0 ? 'project' : 'task',
     assignees: task.assignees,
     status: task.status,
     priority: task.priority
   }))
   
   const ganttLinks = task.dependencies.map(dep => ({
     id: dep.id,
     source: dep.predecessorId,
     target: dep.successorId,
     type: dep.type // 'finish-to-start', 'start-to-start', etc.
   }))
   ```
4. SVAR Gantt renders with:
   - **Left panel**: Tree view of tasks (hierarchical, collapsible)
   - **Right panel**: Timeline with bars and dependency arrows
   - **Scales**: Day/Week/Month selectable in toolbar
5. User drags task bar → changes `startDate` and `endDate`
6. User resizes bar → changes `duration` and `dueDate`
7. User drags dependency arrow from one task to another → creates link
8. Each action triggers **Optimistic update** → **API mutation** → **Socket.IO broadcast**

**Gantt Features**:
- **Critical Path**: Highlight tasks in red if delay impacts project deadline
- **Baseline**: Show original plan as gray ghost bars (if baseline saved)
- **Milestones**: Display diamond shape for zero-duration tasks
- **Auto-scheduling**: Adjust dependent tasks when predecessor changes
- **Zoom**: Pinch or toolbar buttons to zoom timeline (0.5x to 2x)
- **Today line**: Vertical line showing current date

**Timezone Handling**:
- All dates displayed in user's timezone (via `date-fns-tz`)
- Backend stores as UTC `TIMESTAMPTZ`
- Gantt scale adjusts for DST transitions

**Real-Time Sync**:
```typescript
useProjectTaskEvents(projectId, true)
// Gantt updates bars and links on events
// Conflicts resolved by last-write-wins (backend enforces)
```

**Edge Cases**:
- **Circular dependencies**: Prevented by backend validation
- **Overlapping tasks**: Allowed (no resource leveling yet)
- **Missing dates**: Tasks without dates shown at project start
- **Deleted dependency**: Arrow disappears, no cascade delete

---

### Flow 3: Analyze Progress with Charts (FE-12c)

**Trigger**: User clicks "Charts" tab

**Steps**:
1. UI shows chart selector dropdown (default: Burndown)
2. **Client fetches** chart data based on selection

#### Chart 1: Burndown Chart (Line Chart)
**Purpose**: Show ideal vs. actual task completion over time

**Data Source**: 
```typescript
const { data: burndownData } = useBurndownChart(projectId, dateRange)
// Returns: [{ date: '2024-01-01', ideal: 50, actual: 48 }, ...]
```

**Visualization** (Recharts):
- **X-axis**: Dates (daily or weekly)
- **Y-axis**: Remaining tasks count
- **Lines**:
  - Blue line: Ideal burndown (straight diagonal)
  - Orange line: Actual burndown (actual task completion)
- **Area fill**: Red if behind schedule, green if ahead
- **Tooltip**: "Jan 15: 12 tasks remaining (ideal: 10)"

#### Chart 2: Progress Overview (Pie Chart)
**Purpose**: Show task distribution by status

**Data Source**:
```typescript
const { data: progressData } = useProgressChart(projectId)
// Returns: [
//   { name: 'To Do', value: 15, color: '#gray' },
//   { name: 'In Progress', value: 8, color: '#blue' },
//   { name: 'Review', value: 3, color: '#yellow' },
//   { name: 'Done', value: 24, color: '#green' }
// ]
```

**Visualization** (Recharts):
- Donut chart with status colors
- Legend with percentages
- Click segment → filter tasks by status

#### Chart 3: Assignee Workload (Bar Chart)
**Purpose**: Show task count per assignee

**Data Source**:
```typescript
const { data: workloadData } = useWorkloadChart(projectId)
// Returns: [
//   { name: 'John Doe', assigned: 12, completed: 8 },
//   { name: 'Jane Smith', assigned: 15, completed: 12 }
// ]
```

**Visualization** (Recharts):
- **X-axis**: Assignee names
- **Y-axis**: Task count
- **Bars**:
  - Gray bar: Total assigned
  - Green bar: Completed (stacked)
- **Tooltip**: "John Doe: 8/12 tasks completed (67%)"

#### Chart 4: Timeline Overview (Area Chart)
**Purpose**: Show task creation and completion trends

**Data Source**:
```typescript
const { data: timelineData } = useTimelineChart(projectId, dateRange)
// Returns: [
//   { date: '2024-01-01', created: 5, completed: 3 },
//   { date: '2024-01-02', created: 2, completed: 4 }
// ]
```

**Visualization** (Recharts):
- **X-axis**: Dates
- **Y-axis**: Task count
- **Areas**:
  - Blue area: Tasks created
  - Green area: Tasks completed
- **Net line**: Created minus completed (velocity)

**Interactive Filters**:
- Date range picker (last week, month, quarter, year, custom)
- Assignee filter (multi-select dropdown)
- Status filter (checkboxes: to do, in progress, done)
- Apply filters → refetch chart data

**Export**:
- "Download as PNG" → saves chart image
- "Export data as CSV" → downloads underlying data

---

## Empty/Loading/Error States

### Grid View

**Loading**:
```
┌────────────────────────────────────┐
│ Title       | Assignee | Status   │
├────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓  | ▓▓▓▓▓   | ▓▓▓▓     │
│ ▓▓▓▓▓▓▓▓▓  | ▓▓▓▓▓   | ▓▓▓▓     │
└────────────────────────────────────┘
```

**Empty** (no tasks):
```
┌────────────────────────────────────┐
│                                    │
│    📋 No tasks yet                 │
│    Create your first task to get   │
│    started with this project       │
│                                    │
└────────────────────────────────────┘
```

### Gantt View

**Loading**:
- Skeleton timeline with 5 gray bars
- Preserve timeline scale

**Empty** (no tasks with dates):
```
┌────────────────────────────────────┐
│    📅 No scheduled tasks           │
│    Add start and due dates to     │
│    tasks to see them here          │
└────────────────────────────────────┘
```

**Error** (invalid dependencies):
```
⚠️ Circular dependency detected
Tasks cannot depend on each other in a loop.
Please remove one of the dependencies.
```

### Charts View

**Loading**:
- Show skeleton chart with shimmer effect

**Empty** (no data):
```
┌────────────────────────────────────┐
│    📊 Not enough data              │
│    Complete a few tasks to see     │
│    progress charts                 │
└────────────────────────────────────┘
```

---

## Edge Cases & Validation

### Grid Editing
- **Concurrent edits**: Optimistic update, backend resolves conflicts (last write wins)
- **Invalid values**: Client-side validation before API call (e.g., date format)
- **Permission check**: Disabled cells for read-only users
- **Large datasets**: Virtualize rows if >1000 tasks

### Gantt Constraints
- **Start before end**: Prevent user from setting end date before start date
- **Negative duration**: Auto-adjust if user drags bar to negative
- **Dependency cycles**: Backend validates and rejects circular links
- **Resource over-allocation**: Visual warning (yellow highlight) if assignee has >10 concurrent tasks

### Charts Accuracy
- **Timezone consistency**: All dates in charts use user's timezone
- **Missing data**: Fill gaps with zero values or interpolate
- **Real-time updates**: Refetch chart data when Socket.IO event received (debounced 5s)

---

## Acceptance Criteria

### FE-12a: SVAR DataGrid Integration
- [x] Grid renders with all tasks in project
- [x] Inline editing works for text, select, date, number fields
- [x] Multi-assignee cell shows avatars with popover
- [x] Sorting works (single and multi-column)
- [x] Filtering works (text search, equals, range)
- [x] Column resizing persists in localStorage
- [x] Export to CSV includes all visible columns
- [x] Real-time updates from Socket.IO events (<1s latency)
- [x] Optimistic editing with rollback on error

### FE-12b: SVAR Gantt Integration
- [x] Gantt renders task bars with correct start/end dates
- [x] Drag bar → updates dates and saves to backend
- [x] Resize bar → updates duration and due date
- [x] Drag dependency arrow → creates link
- [x] Delete dependency → removes link (with confirmation)
- [x] Critical path highlighted in red
- [x] Baseline shows as ghost bars (if enabled)
- [x] Zoom controls work (0.5x to 2x)
- [x] Scale selector works (day/week/month)
- [x] Real-time sync across all clients <1s

### FE-12c: Charts View
- [x] All 4 chart types render correctly
- [x] Charts update when filters applied
- [x] Export to PNG downloads chart image
- [x] Export to CSV downloads chart data
- [x] Date range picker works
- [x] Click pie segment → filters tasks by status
- [x] Charts refetch on Socket.IO events (debounced)
- [x] Tooltips show detailed data on hover

---

## WebSocket Events (Existing, from FE-12)

All views listen to same events:
```typescript
socket.on('project:task_created', (event) => {
  // Grid: Add row
  // Gantt: Add bar
  // Charts: Refetch data (debounced)
})

socket.on('project:task_updated', (event) => {
  // Grid: Update cell
  // Gantt: Update bar position/duration
  // Charts: Refetch data (debounced)
})

socket.on('project:task_moved', (event) => {
  // Grid: Update bucket column
  // Gantt: No change (bucket not shown)
  // Charts: Refetch data (debounced)
})

socket.on('project:task_deleted', (event) => {
  // Grid: Remove row
  // Gantt: Remove bar and dependencies
  // Charts: Refetch data (debounced)
})
```

---

## API Endpoints (New - Backend Contract Request)

### Chart Data Endpoints
- `GET /projects/:id/charts/burndown?start=YYYY-MM-DD&end=YYYY-MM-DD`
  - **Response**: `{ data: [{ date, ideal, actual }] }`
  
- `GET /projects/:id/charts/progress`
  - **Response**: `{ data: [{ status, count, percentage }] }`
  
- `GET /projects/:id/charts/workload?assigneeId=...`
  - **Response**: `{ data: [{ assigneeName, assigned, completed }] }`
  
- `GET /projects/:id/charts/timeline?start=YYYY-MM-DD&end=YYYY-MM-DD`
  - **Response**: `{ data: [{ date, created, completed }] }`

### Dependency Management
- `POST /projects/:id/tasks/:taskId/dependencies`
  - **Body**: `{ predecessorId: string, type: 'finish-to-start' }`
  - **Response**: `{ dependency }`
  
- `DELETE /projects/:id/tasks/:taskId/dependencies/:depId`
  - **Response**: `{ success: true }`

---

## SVAR Library Integration

### Installation (Already in package.json alternatives)
Since SVAR is commercial, alternatives:
- **Free alternative for Grid**: `ag-grid-community` or `react-data-grid`
- **Free alternative for Gantt**: `dhtmlx-gantt` (GPL) or `frappe-gantt`

### If using SVAR (licensed):
```bash
npm install @wx/willow-datagrid @wx/willow-gantt
```

### Grid Configuration
```typescript
import { DataGrid } from '@wx/willow-datagrid'

<DataGrid
  data={tasks}
  columns={gridColumns}
  editable={true}
  onCellEdit={(rowId, field, value) => {
    updateTask.mutate({ taskId: rowId, updates: { [field]: value } })
  }}
  sort={gridSort}
  onSort={setGridSort}
  filters={gridFilters}
  onFilter={setGridFilters}
  rowHeight={48}
  virtualScroll={true}
/>
```

### Gantt Configuration
```typescript
import { Gantt } from '@wx/willow-gantt'

<Gantt
  tasks={ganttData}
  links={ganttLinks}
  scale={ganttScale}
  zoom={ganttZoom}
  onTaskDrag={(task, start, end) => {
    updateTask.mutate({ 
      taskId: task.id, 
      updates: { startDate: start, dueDate: end } 
    })
  }}
  onLinkCreate={(source, target) => {
    createDependency.mutate({ taskId: target, predecessorId: source })
  }}
  onLinkDelete={(linkId) => {
    deleteDependency.mutate(linkId)
  }}
  showCriticalPath={ganttShowCriticalPath}
  showBaseline={ganttShowBaseline}
/>
```

---

## Performance Optimization

### Grid Performance
- **Virtualization**: Render only visible rows (20-50 at a time)
- **Debounce editing**: 500ms delay before API call
- **Batch updates**: Group multiple cell edits into single API call
- **Memoization**: Use `React.memo` for row components

### Gantt Performance
- **Lazy load**: Load tasks on-demand for large projects (>500 tasks)
- **Throttle drag**: Update bar position every 16ms (60fps)
- **WebGL rendering**: Use canvas for timeline (if supported by library)
- **Compress links**: Hide dependency arrows at low zoom levels

### Charts Performance
- **Debounce refetch**: 5s delay after Socket.IO event before refetching
- **Cache data**: Use `staleTime: 60_000` (1 minute) for chart queries
- **Lazy load**: Only fetch chart data when tab is active
- **Downsample**: If >1000 data points, aggregate by week instead of day

---

## Design Tokens

### Grid Colors
- **Header background**: `bg-gray-100 dark:bg-gray-800`
- **Row hover**: `hover:bg-gray-50 dark:hover:bg-gray-700`
- **Selected row**: `bg-blue-50 dark:bg-blue-900`
- **Editable cell**: `cursor-pointer border-blue-300 focus:ring-2`

### Gantt Colors
- **Task bar (To Do)**: `#94A3B8` (gray)
- **Task bar (In Progress)**: `#3B82F6` (blue)
- **Task bar (Review)**: `#F59E0B` (yellow)
- **Task bar (Done)**: `#10B981` (green)
- **Critical path**: `#EF4444` (red)
- **Baseline**: `#9CA3AF` (light gray, 50% opacity)
- **Dependency arrow**: `#6B7280` (gray, dashed)

### Chart Colors (consistent palette)
- **Primary**: `#3B82F6` (blue)
- **Secondary**: `#10B981` (green)
- **Accent**: `#F59E0B` (orange)
- **Danger**: `#EF4444` (red)
- **Neutral**: `#6B7280` (gray)

---

## Accessibility (WCAG 2.1 AA)

### Grid A11y
- Grid has `role="grid"` with `aria-label="Project tasks"`
- Cells have `role="gridcell"` with `aria-label` for screen readers
- Keyboard navigation: `Tab`, `Enter` to edit, `Esc` to cancel
- Editable cells have `aria-readonly="false"`

### Gantt A11y
- Gantt has `role="application"` (complex widget)
- Task bars have `aria-label="Task: {title}, from {start} to {end}"`
- Keyboard navigation: `Arrow keys` to navigate, `Space` to select
- High contrast mode: Increase bar border width to 2px

### Charts A11y
- Charts have descriptive `aria-label`
- Data tables available below charts (toggle "Show data table")
- Keyboard navigation: `Tab` through chart elements
- Color-blind safe: Use patterns in addition to colors

---

## Testing Strategy

### Unit Tests
- `SVARDataGrid` renders all columns correctly
- `SVARGantt` calculates critical path correctly
- Chart components render with mock data

### Integration Tests
- Edit task in Grid → verify Board view updates
- Drag task in Gantt → verify Grid view updates
- Complete task → verify Charts view updates

### E2E Tests (Playwright)
1. Switch to Grid view → verify tasks render
2. Edit task title inline → verify saves and updates other views
3. Switch to Gantt → drag task bar → verify dates update
4. Create dependency → verify arrow appears
5. Switch to Charts → verify burndown chart shows data
6. Apply filter → verify chart updates

---

## Migration Notes

### Existing Tasks
- Tasks without `startDate` → default to `createdAt`
- Tasks without `dueDate` → show warning in Gantt, exclude from burndown

### Historical Data
- Generate burndown data from audit log (if available)
- Otherwise start burndown tracking from current date

---

## References
- SVAR DataGrid docs: (if using licensed version)
- Alternative: ag-grid-community [ag-grid.com](https://www.ag-grid.com/)
- Alternative: frappe-gantt [frappe.io/gantt](https://frappe.io/gantt)
- Recharts docs: [recharts.org](https://recharts.org/)
- Backend projects service: `c:/EPop/backend/src/projects/projects.service.ts`
