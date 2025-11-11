# Implementation Prompt: Projects (Kanban/Gantt)

**Target:** Claude Sonnet 4.5  
**Purpose:** Generate React components, Storybook stories, and accessibility tests  
**Reference:** [UI-SPEC-PROJECTS-KANBAN-GANTT.md](./UI-SPEC-PROJECTS-KANBAN-GANTT.md)

---

## Context

Implementing project management with 3 views: Kanban board, Gantt chart, and Table list.

**Tech Stack:**
- Next.js 14 + Tailwind + shadcn/ui
- **@tanstack/react-table** — For table view
- **@tanstack/react-virtual** — For virtualization (1k+ tasks)
- **@hello-pangea/dnd** (optional) — For drag & drop
- Lucide React icons

**Key Constraint:** Custom Gantt implementation using CSS Grid + absolute positioned bars. **No external Gantt libraries** (no dhtmlx-gantt, no react-gantt-chart, etc.).

**Reference:** All requirements in `UI-SPEC-PROJECTS-KANBAN-GANTT.md`

---

## Task: Implement Projects Module

### Core Components (in `components/projects/`)

#### 1. `ProjectViewSwitcher.tsx`
**Props:**
```typescript
interface ProjectViewSwitcherProps {
  view: 'kanban' | 'gantt' | 'list'
  onChange: (view: string) => void
}
```

**Requirements:**
- Tab-like buttons: [Kanban 📋] [Gantt 📊] [List 📄]
- Selected view highlighted `bg-accent`
- Keyboard: 1/2/3 to switch views
- A11y: `role="tablist"`, `aria-selected`

**Reference:** Section 1 in UI-SPEC-PROJECTS-KANBAN-GANTT.md

---

### Kanban Components

#### 2. `KanbanBoard.tsx`
**Props:**
```typescript
interface KanbanBoardProps {
  lanes: Lane[]
  tasks: Task[]
  onDragEnd: (taskId: string, newLane: string, newPosition: number) => void
  onTaskClick: (taskId: string) => void
  onCreateTask: (laneId: string) => void
}

type Lane = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'blocked' | 'done'

interface Task {
  id: string
  title: string
  status: Lane
  assignee?: User
  priority: 'high' | 'normal' | 'low'
  dueDate?: Date
  tags: string[]
  attachmentCount: number
}
```

**Requirements:**
- 6 lanes horizontal scroll
- Each lane: Header (title + count + WIP limit) + scrollable cards + [+ New] button
- Drag & drop cards between lanes (use @hello-pangea/dnd)
- WIP limit indicator: Yellow at 80%, red when exceeded
- Loading: Skeleton cards (3 per lane)
- Empty lane: "No tasks. Drag here or [+ New]"
- Keyboard: M to open move dialog (fallback)
- Responsive: Mobile shows 1 lane at a time with swipe

**Reference:** Section 2 in UI-SPEC-PROJECTS-KANBAN-GANTT.md

---

#### 3. `KanbanLane.tsx`
**Props:**
```typescript
interface KanbanLaneProps {
  lane: Lane
  tasks: Task[]
  wipLimit?: number
  onTaskClick: (taskId: string) => void
  onCreateTask: () => void
  droppableId: string
}
```

**Requirements:**
- Lane header with title, count badge, [...] menu
- WIP limit badge (changes color near/at limit)
- Droppable area for DnD
- Scrollable card container
- A11y: `role="group" aria-label="Backlog lane with 45 tasks"`

---

#### 4. `KanbanCard.tsx`
**Props:**
```typescript
interface KanbanCardProps {
  task: Task
  onClick: () => void
  draggableId: string
  index: number
}
```

**Requirements:**
- Title (1 line, ellipsis)
- Assignee avatar + priority badge + attachment icon
- Due date (red if overdue)
- Tag chips (max 2 visible, rest in ...)
- Hover: Shadow + quick actions
- Dragging: Lift with shadow
- States: Default, hover, dragging, overdue, blocked
- A11y: `role="article" aria-label="Task: [title], assigned to [name]"`

**Reference:** Section 2.2 in UI-SPEC-PROJECTS-KANBAN-GANTT.md

---

#### 5. `TaskDetailModal.tsx`
**Props:**
```typescript
interface TaskDetailModalProps {
  task?: Task
  onSave: (data: TaskFormData) => void
  onClose: () => void
  mode: 'create' | 'edit'
}

interface TaskFormData {
  title: string
  description: string
  status: Lane
  assignee?: User
  priority: 'high' | 'normal' | 'low'
  dueDate?: Date
  tags: string[]
  attachments: File[]
}
```

**Requirements:**
- Form fields: Title*, Status, Assignee, Priority, Due Date, Tags, Description (rich text)
- Attachments section with upload
- Comments section (threaded)
- Keyboard: Cmd+Enter save, Escape close
- Validation: Title required
- A11y: Dialog focus trap, return focus on close

**Reference:** Section 2.3 in UI-SPEC-PROJECTS-KANBAN-GANTT.md

---

### Gantt Components

#### 6. `GanttChart.tsx`
**Props:**
```typescript
interface GanttChartProps {
  tasks: Task[]
  timeScale: 'day' | 'week' | 'month'
  onTaskUpdate: (taskId: string, startDate: Date, endDate: Date) => void
  onDependencyCreate: (fromId: string, toId: string) => void
}
```

**Requirements:**
- **Architecture:** CSS Grid layout, NO external Gantt library
- Structure:
  ```
  Grid: [300px task names] | [1fr timeline]
  Timeline: CSS Grid columns for time scale
  Bars: Absolute positioned divs within timeline
  ```
- Timeline header with date labels
- Task rows (virtualized with @tanstack/react-virtual)
- Task bars (colored rectangles, positioned by date)
- Dependencies as SVG lines with arrows
- Interactions:
  - Drag bar horizontally to move dates
  - Resize bar edges to adjust duration
  - Drag from bar edge to create dependency
- Zoom controls: Day/Week/Month + [Fit All] + [Today] button
- Today marker: Vertical red line
- Loading: Skeleton rows
- Empty: "No tasks scheduled"
- Keyboard: Arrow keys navigate, +/- zoom, T jump to today

**Reference:** Section 3 in UI-SPEC-PROJECTS-KANBAN-GANTT.md

**Implementation Guide:**
```typescript
// Layout structure
<div className="grid grid-cols-[300px_1fr]">
  {/* Left: Task names */}
  <GanttTaskList tasks={tasks} />
  
  {/* Right: Timeline */}
  <div className="relative overflow-x-auto">
    <GanttTimeline scale={timeScale} />
    <GanttBars tasks={tasks} scale={timeScale} />
    <GanttDependencies deps={dependencies} />
  </div>
</div>

// Bar positioning calculation
const dayWidth = timeScale === 'day' ? 40 : timeScale === 'week' ? 150 : 200
const chartStartDate = minDate(tasks.map(t => t.startDate))
const barLeft = (task.startDate - chartStartDate) / (1000*60*60*24) * dayWidth
const barWidth = (task.endDate - task.startDate) / (1000*60*60*24) * dayWidth

<div
  className="absolute h-8 bg-primary rounded cursor-move"
  style={{
    left: `${barLeft}px`,
    width: `${barWidth}px`,
    top: `${rowIndex * 48}px` // 48px row height
  }}
  draggable
  onDrag={handleDrag}
>
  {task.title}
</div>
```

---

#### 7. `GanttTimeline.tsx`
**Props:**
```typescript
interface GanttTimelineProps {
  scale: 'day' | 'week' | 'month'
  startDate: Date
  endDate: Date
}
```

**Requirements:**
- Horizontal header with date labels
- CSS Grid columns for each time unit
- Today marker (vertical red line)
- Tick marks for scale

---

#### 8. `GanttDependency.tsx`
**Props:**
```typescript
interface GanttDependencyProps {
  fromTask: Task
  toTask: Task
  type?: 'finish-to-start' | 'start-to-start'
}
```

**Requirements:**
- SVG path from end of bar1 to start of bar2
- Arrow marker at end
- Elbow bends if tasks on different rows
- Hover: Highlight + tooltip
- Click: Show details + remove option

**SVG Path Calculation:**
```typescript
const path = `
  M ${x1} ${y1}
  L ${x1 + 20} ${y1}
  L ${x1 + 20} ${y2}
  L ${x2} ${y2}
`
```

---

### Table Components

#### 9. `ProjectTable.tsx`
**Props:**
```typescript
interface ProjectTableProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onBulkAction: (action: string, ids: string[]) => void
}
```

**Requirements:**
- Use **@tanstack/react-table**
- Columns: Checkbox, ID, Title, Assignee (avatar), Status (badge), Priority (icon), Due Date
- Features:
  - Sorting (click headers, multi-column with Shift)
  - Filtering (dropdown per column)
  - Grouping (by status/assignee)
  - Column visibility toggle
  - Row selection (checkbox)
  - Inline editing (double-click cell)
  - Pagination (50/100/200 per page)
- Virtualization: Use @tanstack/react-virtual if >200 rows
- Bulk actions: Archive, Delete, Export CSV
- Keyboard: Arrow keys navigate, Space select, Enter edit
- A11y: `role="table"`, sortable headers `aria-sort`

**Reference:** Section 4 in UI-SPEC-PROJECTS-KANBAN-GANTT.md

**TanStack Table Setup:**
```typescript
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'

const table = useReactTable({
  data: tasks,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  enableRowSelection: true,
})
```

---

### Shared Components

#### 10. `FilterBar.tsx`
**Props:**
```typescript
interface FilterBarProps {
  onFilterChange: (filters: TaskFilters) => void
  activeFilters: TaskFilters
}

interface TaskFilters {
  status?: Lane[]
  assignee?: string[]
  priority?: ('high' | 'normal' | 'low')[]
  dueDateRange?: [Date, Date]
  tags?: string[]
  search?: string
}
```

**Requirements:**
- Search input (fuzzy match)
- Filter dropdowns: Status, Assignee, Priority, Due Date, Tags
- Active filter count badge
- [Clear all] button
- A11y: `role="search"`

---

## Storybook Stories (in `stories/projects/`)

### `KanbanBoard.stories.tsx`
- Default (all lanes with tasks)
- WithWIPLimit (progress lane at limit)
- DragPreview (mock dragging state)
- Loading (skeleton cards)
- Empty (no tasks)

### `GanttChart.stories.tsx`
- Default (10-20 tasks)
- WithDependencies (arrows connecting tasks)
- DayScale (zoomed to day view)
- WeekScale (week view)
- MonthScale (month view)
- Conflict (red bar, task blocked by dependency)
- Loading (skeleton)

### `ProjectTable.stories.tsx`
- Default (50 tasks)
- Sorted (by due date)
- Filtered (only high priority)
- Grouped (by status)
- Selected (bulk action bar visible)
- InlineEdit (cell in edit mode)

### Additional Stories
- `KanbanCard.stories.tsx` — Default, overdue, blocked, high priority
- `TaskDetailModal.stories.tsx` — Create mode, edit mode, with attachments
- `FilterBar.stories.tsx` — Empty, with active filters

---

## Accessibility Tests (in `__tests__/projects/`)

### `KanbanBoard.test.tsx`
```typescript
describe('KanbanBoard Accessibility', () => {
  it('has role="group" per lane', () => {})
  it('announces WIP limit warnings', () => {})
  it('supports keyboard card movement (M key)', () => {})
  it('drag preview has accessible label', () => {})
})
```

### `GanttChart.test.tsx`
```typescript
describe('GanttChart Accessibility', () => {
  it('has role="treegrid"', () => {})
  it('bars have aria-label with dates', () => {})
  it('supports keyboard zoom (+/- keys)', () => {})
  it('announces drag date changes', () => {})
})
```

### `ProjectTable.test.tsx`
```typescript
describe('ProjectTable Accessibility', () => {
  it('has proper table semantics', () => {})
  it('sortable headers have aria-sort', () => {})
  it('supports keyboard navigation (arrows)', () => {})
  it('inline edit cells accessible', () => {})
})
```

---

## Implementation Guidelines

### Drag & Drop (Kanban)
Use @hello-pangea/dnd:
```typescript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId={lane.id}>
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {tasks.map((task, index) => (
          <Draggable draggableId={task.id} index={index}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <KanbanCard task={task} />
              </div>
            )}
          </Draggable>
        ))}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

### Gantt Bar Dragging
Use native pointer events:
```typescript
const handleBarDrag = (e: React.PointerEvent, task: Task) => {
  const deltaX = e.clientX - startX
  const daysDelta = Math.round(deltaX / dayWidth)
  const newStartDate = addDays(task.startDate, daysDelta)
  const newEndDate = addDays(task.endDate, daysDelta)
  onTaskUpdate(task.id, newStartDate, newEndDate)
}
```

### Virtualization
Use @tanstack/react-virtual:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: tasks.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 48, // Row height
  overscan: 5,
})

{virtualizer.getVirtualItems().map((virtualRow) => {
  const task = tasks[virtualRow.index]
  return <TaskRow key={virtualRow.key} task={task} style={virtualRow.style} />
})}
```

---

## Performance Targets

- Kanban: Smooth drag with 500 cards
- Gantt: Smooth scroll with 1000 tasks (virtualized)
- Table: Sort/filter 10k tasks <500ms

---

## Commands

```bash
# Install dependencies
pnpm add @tanstack/react-table @tanstack/react-virtual @hello-pangea/dnd

# Storybook
pnpm storybook

# Tests
pnpm test projects
```

---

## Verification Checklist

**Kanban:**
- [ ] 6 lanes render correctly
- [ ] Drag & drop works smoothly
- [ ] WIP limit indicators functional
- [ ] Keyboard move fallback (M key)

**Gantt:**
- [ ] Custom implementation (no external lib)
- [ ] Bars render at correct positions
- [ ] Drag/resize updates dates
- [ ] Dependencies draw correctly
- [ ] Zoom works (day/week/month)
- [ ] Virtualized (smooth with 1k tasks)

**Table:**
- [ ] TanStack Table configured
- [ ] Sort/filter/group work
- [ ] Inline editing functional
- [ ] Virtualized if >200 rows

**Accessibility:**
- [ ] All tests pass
- [ ] Keyboard navigation complete
- [ ] Screen reader announces state changes

---

## Success Criteria

✅ All 3 views functional in Storybook  
✅ Gantt custom implementation (CSS Grid + absolute bars)  
✅ TanStack Table + Virtual working  
✅ Drag & drop smooth (Kanban)  
✅ 1000+ tasks performant (virtualized)  
✅ Accessibility tests 100% pass  
✅ Visual matches UI-SPEC-PROJECTS-KANBAN-GANTT.md

---

**Implementation Order:**
1. ViewSwitcher, FilterBar (shared)
2. Kanban (Board, Lane, Card, Modal)
3. Table (TanStack Table setup)
4. Gantt (Timeline, Bars, Dependencies — most complex)
