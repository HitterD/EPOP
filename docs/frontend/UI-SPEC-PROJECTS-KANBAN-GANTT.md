# UI Specification: Projects (Kanban/Gantt)

## Overview
Project management with 3 views: Kanban board, Gantt chart, and Table list. Uses TanStack Table + Virtual for performance. No external Gantt libraries—CSS Grid + absolute positioning for timeline bars.

---

## 1. View Switcher

**Component:** `ProjectViewSwitcher`

**Props:** `view: 'kanban' | 'gantt' | 'list'`, `onChange`

**Layout:**
```
[Kanban 📋] [Gantt 📊] [List 📄]  |  [+ New Task]  [Filter ▼]  [Sort ▼]
```

**States:** Selected view highlighted `bg-accent`, others `hover:bg-accent/50`

**Keyboard:** `1` kanban, `2` gantt, `3` list, `N` new task

**A11y:** `role="tablist"`, `aria-selected="true"` on active

---

## 2. Kanban View

### KanbanBoard
**Props:** `lanes`, `tasks`, `onDragEnd`, `onTaskClick`, `onCreateTask`

**Lanes:**
```typescript
type Lane = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'blocked' | 'done'
```

**Layout:**
```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Backlog  │ To Do    │Progress  │ Review   │ Blocked  │ Done     │
│   (45)   │   (12)   │   (8)    │   (3)    │   (2)    │  (120)   │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│[Card]    │[Card]    │[Card]    │[Card]    │[Card]    │[Card]    │
│[Card]    │[Card]    │[Card]    │          │          │[Card]    │
│[Card]    │          │[Card]    │          │          │          │
│ ...      │          │          │          │          │          │
│          │          │          │          │          │          │
│[+ New]   │[+ New]   │[+ New]   │[+ New]   │[+ New]   │[+ New]   │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Lane Header:**
- Title + count badge
- WIP limit indicator: "In Progress (8/10)" → yellow when near limit, red when exceeded
- `[...]` menu: Clear completed, set WIP limit, collapse

**Drag & Drop:**
- Library: `@hello-pangea/dnd` or native Pointer API
- Visual: Card lifts with shadow, placeholder shows drop target
- Constraints: Can't drag to Done from Backlog directly (validation)
- Optimistic: Move immediately, revert on server error

**Keyboard Fallback (non-mouse):**
- Focus card → `M` open move dialog
- Select lane with arrow keys → Enter to move
- Announce: "Moved Task ABC to In Progress"

**WIP Limits:**
- Set per lane: "In Progress max 10 tasks"
- Visual: Badge turns `bg-yellow-500` at 80%, `bg-red-500` if exceeded
- Warning on drag: "In Progress is at limit. Proceed anyway?"

**States:**
- **Loading:** Skeleton cards (3 per lane)
- **Empty lane:** "No tasks. Drag here or [+ New]"
- **Error:** Toast "Failed to move task. [Retry]"
- **Optimistic:** Card immediately moves, spinner icon in corner until confirmed

**Responsive:**
- Desktop: 6 lanes horizontal scroll
- Tablet: 3 lanes visible, scroll
- Mobile: 1 lane at a time with swipe navigation + dropdown to switch

**A11y:**
- `role="group"` per lane
- `aria-label="Backlog lane with 45 tasks"`
- DnD: Keyboard alternative mandatory
- Live region announces lane changes

---

### KanbanCard
**Props:** `task`, `onClick`, `onEdit`, `onDelete`

**Layout:**
```
┌─────────────────────────────┐
│ [EPIC-123] Setup API        │ ← Title
│ [Alice]  [🔴 High]  [📎 2]  │ ← Assignee, Priority, Attachments
│ Due: Jan 20                 │ ← Due date (red if overdue)
│ [design] [backend]          │ ← Tags
└─────────────────────────────┘
```

**Card States:**
- **Default:** `bg-card border`
- **Hover:** `shadow-md` + show quick actions (edit/delete)
- **Dragging:** `opacity-50` at origin, full opacity at cursor
- **Overdue:** Red border + "⚠️ Overdue"
- **Blocked:** Orange border + "🚧 Blocked"

**Quick Actions (hover):**
- Edit (opens modal)
- Delete (confirmation)
- Assign to me
- Quick status change

**Priority Badge:**
- High: `🔴 bg-red-500/10 text-red-700`
- Normal: No badge
- Low: `🔵 bg-blue-500/10`

**A11y:**
- `role="article" aria-label="Task: Setup API, assigned to Alice"`
- Due date: `aria-label="Due January 20, in 5 days"`
- Buttons: `aria-label="Edit task"`

---

### TaskDetailModal
**Props:** `task`, `onSave`, `onClose`

**Layout:**
```
┌──────────────────────────────────────┐
│ [EPIC-123] Setup API           [× ] │
├──────────────────────────────────────┤
│ Status:   [In Progress ▼]            │
│ Assignee: [Alice Chen ▼]             │
│ Priority: [High ▼]                   │
│ Due:      [Jan 20, 2025]  [📅]       │
│ Tags:     [design] [backend] [+ Add] │
├──────────────────────────────────────┤
│ Description:                         │
│ [Rich text editor...]                │
├──────────────────────────────────────┤
│ Attachments:                         │
│ [doc.pdf] [image.png]                │
│ [+ Add file]                         │
├──────────────────────────────────────┤
│ Comments: (3)                        │
│ [Comment thread...]                  │
├──────────────────────────────────────┤
│                 [Cancel]  [Save]     │
└──────────────────────────────────────┘
```

**Fields:**
- **Title:** Text input, required
- **Status:** Dropdown (all lanes)
- **Assignee:** Searchable dropdown with avatars
- **Priority:** Radio buttons (High/Normal/Low)
- **Due date:** Date picker
- **Tags:** Multi-select chips
- **Description:** Rich text (bold, italic, lists, links)
- **Attachments:** Drag-drop + progress
- **Comments:** Threaded, real-time updates

**Validation:**
- Title required
- Due date can't be in past for new tasks
- Assignee must be active user

**Keyboard:** `Cmd+Enter` save, `Escape` close (confirm if changed)

**A11y:** Focus trap, return focus to card trigger on close

---

## 3. Gantt View

### GanttChart
**Props:** `tasks`, `timeScale: 'day' | 'week' | 'month'`, `onTaskUpdate`, `onDependencyCreate`

**Architecture:** No external lib. Custom CSS Grid + absolute positioned bars.

**Layout:**
```
┌──────────────┬────────────────────────────────────────────────┐
│ Task Name    │ Jan 15  16  17  18  19  20  21  22  23  24  25 │
├──────────────┼────────────────────────────────────────────────┤
│ EPIC-123     │   [════════════════════]                       │ ← Bar
│ EPIC-124     │                    [══════════]                │
│ EPIC-125     │      [═══]                                     │
│              │        └──────────┐                            │ ← Dependency line
├──────────────┴────────────────────────────────────────────────┤
│ [Zoom: Day ▼]  [Today]  [Fit All]                            │
└────────────────────────────────────────────────────────────────┘
```

**Structure:**
```typescript
<div className="grid grid-cols-[300px_1fr]">
  {/* Left: Task names */}
  <div className="border-r">
    <GanttTaskList tasks={tasks} />
  </div>
  
  {/* Right: Timeline */}
  <div className="relative overflow-x-auto">
    <GanttTimeline scale={timeScale} />
    <GanttBars tasks={tasks} scale={timeScale} />
    <GanttDependencies dependencies={deps} />
  </div>
</div>
```

**Timeline Scale:**
- **Day:** Each column = 1 day, show date labels
- **Week:** Each column = 1 week, show week numbers
- **Month:** Each column = 1 month, show month names

**Bar Rendering:**
```typescript
const barLeft = (task.startDate - chartStartDate) / dayWidth
const barWidth = (task.endDate - task.startDate) / dayWidth

<div
  className="absolute h-8 bg-primary rounded"
  style={{ 
    left: `${barLeft}px`, 
    width: `${barWidth}px`,
    top: `${rowIndex * 48}px` // 48px row height
  }}
>
  {task.title}
</div>
```

**Interactions:**
- **Drag bar horizontally:** Change start/end dates
- **Resize bar:** Drag left/right edges to adjust dates
- **Click bar:** Open TaskDetailModal
- **Drag from bar corner:** Create dependency line to another task

**Dependencies:**
- Visual: SVG line with arrow from end of Task A to start of Task B
- Types: Finish-to-Start (default), Start-to-Start, Finish-to-Finish
- Constraint: Detect circular dependencies, show error

**Zoom Controls:**
- Day: Min zoom, max detail
- Week: Medium zoom
- Month: Max zoom, shows more tasks
- "Fit All": Auto-scale to show all tasks in viewport

**Today Marker:**
- Vertical red line at current date
- Auto-scroll to today on mount

**Virtualization:**
- Use `@tanstack/react-virtual` for task rows
- Only render visible rows (viewport + overscan)
- Target: Smooth scroll with 1000+ tasks

**States:**
- **Loading:** Skeleton rows + timeline
- **Empty:** "No tasks scheduled. Add tasks in Kanban or List view."
- **Drag:** Show ghost bar, highlight drop target row
- **Invalid drag:** Red border if dates conflict with dependency

**Keyboard:**
- `Arrow keys` - Navigate tasks
- `+/-` - Zoom in/out
- `T` - Jump to today
- `Enter` - Open task detail

**Responsive:**
- Desktop: Full view
- Tablet: Reduce task name width to 200px
- Mobile: Switch to list view (Gantt not practical)

**A11y:**
- `role="treegrid"` for task rows
- Bars: `aria-label="Task ABC from Jan 15 to Jan 20"`
- Drag feedback: Announce date changes
- Keyboard: All interactions accessible

---

### GanttDependency
**Props:** `fromTask`, `toTask`, `type`

**Rendering:**
```typescript
<svg className="absolute inset-0 pointer-events-none">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5">
      <path d="M0,0 L10,5 L0,10 Z" fill="currentColor" />
    </marker>
  </defs>
  <path
    d={calculatePath(fromTask, toTask)}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    markerEnd="url(#arrow)"
  />
</svg>
```

**Path Calculation:**
1. Get bar positions (x1, y1) and (x2, y2)
2. Draw line from end of bar1 to start of bar2
3. Add elbow bends if tasks on different rows
4. Attach arrow marker at end

**Interaction:**
- Hover: Highlight line, show tooltip "Task A blocks Task B"
- Click: Open dependency details, option to remove
- Drag: Create new dependency (drag from bar edge to another bar)

**Conflict Detection:**
- If Task B scheduled before Task A ends → Show warning
- Auto-suggest date adjustment

---

## 4. List View (Table)

### ProjectTable
**Props:** `tasks`, `columns`, `sorting`, `filtering`, `onEdit`

**Library:** `@tanstack/react-table` + `@tanstack/react-virtual`

**Layout:**
```
┌────┬─────────┬──────────┬─────────┬──────────┬─────────┬─────────┐
│ ✓  │ ID      │ Title    │ Assignee│ Status   │ Priority│ Due     │
├────┼─────────┼──────────┼─────────┼──────────┼─────────┼─────────┤
│ [ ]│EPIC-123 │ Setup API│ Alice   │ Progress │   🔴    │ Jan 20  │
│ [✓]│EPIC-124 │ Design   │ Bob     │ Review   │         │ Jan 22  │
│ [ ]│EPIC-125 │ Testing  │ Carol   │ Blocked  │   🔴    │ Jan 18  │
└────┴─────────┴──────────┴─────────┴──────────┴─────────┴─────────┘
[Bulk: Archive]  [Export CSV]        Page 1 of 10  [< 1 2 3 >]
```

**Features:**
- **Sorting:** Click column header, multi-column with Shift+click
- **Filtering:** Dropdown filters per column (status, assignee, priority, date range)
- **Grouping:** Group by status, assignee, or priority
- **Column visibility:** Toggle columns via settings menu
- **Row selection:** Checkbox, bulk actions
- **Inline edit:** Double-click cell to edit (title, status, assignee)
- **Pagination:** 50/100/200 per page, virtualized if >200

**Column Configuration:**
```typescript
const columns = [
  { id: 'select', header: Checkbox, cell: Checkbox, size: 40 },
  { id: 'id', header: 'ID', accessorKey: 'id', size: 100 },
  { id: 'title', header: 'Title', accessorKey: 'title', size: 300 },
  { id: 'assignee', header: 'Assignee', cell: AvatarCell, size: 150 },
  { id: 'status', header: 'Status', cell: BadgeCell, size: 120 },
  { id: 'priority', header: 'Priority', cell: PriorityIcon, size: 100 },
  { id: 'due', header: 'Due Date', cell: DateCell, size: 120 },
  { id: 'actions', header: '', cell: RowActionsMenu, size: 60 },
]
```

**Bulk Actions:**
- Change status
- Assign to user
- Delete
- Archive
- Export selected

**Keyboard:**
- `Arrow keys` - Navigate cells
- `Space` - Select row
- `Enter` - Edit cell or open task
- `Cmd+A` - Select all
- `Cmd+C` - Copy selected rows

**Export:**
- CSV format
- Include all columns or visible only
- Respect current filters/sort

**States:**
- **Loading:** Skeleton rows
- **Empty:** "No tasks found. [Create Task]"
- **Error:** Banner + retry
- **Inline edit:** Cell becomes input, save on blur/Enter

**A11y:**
- `role="table"` with proper headers
- Sortable headers: `aria-sort="ascending"`
- Editable cells: `aria-label="Edit title"`

---

## 5. Shared Components

### TaskFormDialog
**Purpose:** Create/edit task (used across all views)

**Fields:** Title*, Status, Assignee, Priority, Due Date, Tags, Description, Attachments

**Validation:** Title required, due date in future, assignee exists

**Keyboard:** `Cmd+Enter` save, `Escape` cancel

---

### FilterBar
**Purpose:** Filter tasks across views

**Filters:**
- Status (multi-select)
- Assignee (multi-select)
- Priority (multi-select)
- Due date (range picker)
- Tags (multi-select)
- Search (fuzzy match title/description)

**Layout:** `[Search...] [Status ▼] [Assignee ▼] [Priority ▼] [Due ▼] [Clear]`

**Badge:** Show active filter count: "Filters (3)"

**A11y:** `role="search"`, announce filter changes

---

### ExportDialog
**Purpose:** Export tasks to CSV

**Options:**
- Format: CSV
- Scope: All tasks / Visible / Selected
- Columns: All / Custom select

**A11y:** Dialog focus trap

---

## 6. Data Flow & State

### Task State
```typescript
interface Task {
  id: string
  title: string
  description: string
  status: Lane
  assignee: User
  priority: 'high' | 'normal' | 'low'
  dueDate: Date
  startDate?: Date
  endDate?: Date
  tags: string[]
  attachments: Attachment[]
  dependencies: string[] // Task IDs
  createdAt: Date
  updatedAt: Date
}
```

### Optimistic Updates
- Drag card: Update local state immediately, sync to server
- Edit task: Save to local, show spinner, confirm/revert
- Create dependency: Draw line, save to server, remove if fails

### Real-time Sync
- WebSocket events: `task.created`, `task.updated`, `task.moved`, `task.deleted`
- Merge remote changes, avoid conflicts (last-write-wins or CRDT)
- Show notification: "Task ABC updated by Bob"

---

## 7. Performance Targets

- **Kanban:** Smooth drag with 500 cards (60fps)
- **Gantt:** Smooth scroll with 1000 tasks (virtualized)
- **Table:** Sort/filter 10k tasks <500ms (virtualized)
- **Initial load:** Show skeleton <200ms, data <1s

**Optimizations:**
- Virtualize long lists
- Debounce search/filter 300ms
- Lazy load task details (only fetch on modal open)
- Cache rendered components (React.memo)

---

## 8. Keyboard Shortcuts Summary

**Global:**
- `1/2/3` - Switch view
- `N` - New task
- `Cmd+F` - Focus search
- `/` - Focus filter
- `?` - Show shortcuts help

**Kanban:**
- `M` - Move card (keyboard fallback)
- `E` - Edit card
- `Del` - Delete card

**Gantt:**
- `+/-` - Zoom
- `T` - Today
- `Arrow keys` - Navigate

**Table:**
- `Arrow keys` - Navigate
- `Space` - Select
- `Enter` - Edit/Open
- `Cmd+A` - Select all

---

## 9. A11y Checklist

✅ Keyboard: All interactions accessible without mouse  
✅ Screen reader: Announce state changes (lane moves, updates)  
✅ Focus: Visible rings, logical order  
✅ Roles: `tablist`, `group`, `treegrid`, `table`  
✅ Live regions: Task updates, filter results  
✅ Color: Not sole indicator (use icons + text)  
✅ Contrast: 4.5:1 text, 3:1 UI  
✅ Motion: Respect `prefers-reduced-motion`

---

## 10. Edge Cases

**Circular dependency:** Detect on creation, show error "Creates circular dependency"

**Concurrent edit:** Show warning "Alice is editing this task. View only?"

**Overdue tasks:** Highlight red, show at top of Backlog, send notification

**WIP limit exceeded:** Warn on drag, allow override, log to analytics

**Drag conflicts:** Can't move Done → Backlog, validate allowed transitions

**Long title overflow:** Truncate with ellipsis, show full in tooltip

**Missing assignee:** Show "Unassigned", allow filter/sort

**Date conflicts in Gantt:** Show red bar, tooltip "Blocked by EPIC-125"

---

## 11. API Endpoints

```
GET    /api/projects/{projectId}/tasks
POST   /api/tasks                          (title, status, assignee, ...)
PATCH  /api/tasks/{id}                     (partial update)
DELETE /api/tasks/{id}
PATCH  /api/tasks/{id}/move                (newStatus, newPosition)
POST   /api/tasks/{id}/dependencies        (dependsOn: taskId)
DELETE /api/tasks/{id}/dependencies/{depId}
GET    /api/tasks/export?format=csv&scope=all
```

---

**Success Criteria:** All 3 views functional, 1k+ tasks performant, full keyboard nav, WCAG AA, no dev questions.
