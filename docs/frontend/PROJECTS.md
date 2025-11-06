# Projects & Planner Feature

## Overview
Comprehensive project management with multiple views: Board, Grid, Gantt, Schedule, and Charts.

## Implementation Status
- ✅ FE-4: Cursor pagination on task lists
- ✅ FE-5: Idempotency-Key on task create/update
- ✅ FE-12: Real-time sync across Board/Grid/Gantt/Schedule views
- ✅ FE-13: Timezone support (date-fns-tz) + drag-reorder with rollback

## Architecture

### Routes
- `/projects` - Projects list
- `/projects/[projectId]` - Project detail with view tabs

### Views

#### Board View (Kanban)
- Drag-drop tasks between buckets
- Bucket columns (To Do, In Progress, Review, Done)
- Task cards with assignees, labels, due dates
- Add task button per bucket
- Library: `@dnd-kit/core` + `@dnd-kit/sortable`

#### Grid View
- SVAR DataGrid integration
- Columns: Title, Assignees, Status, Priority, Due Date, Progress
- Inline editing
- Sorting and filtering
- Export to CSV

#### Gantt View
- SVAR Gantt integration
- Timeline visualization
- Task dependencies
- Start/end dates
- Progress bars
- Critical path highlighting

#### Schedule View
- Calendar layout (react-big-calendar)
- Tasks as events
- Drag to reschedule
- Month/week/day views

#### Charts View
- Progress overview (recharts)
- Burndown chart
- Task distribution by status
- Assignee workload
- Priority breakdown

## Components

### ProjectBoard (`features/projects/components/project-board.tsx`)
```tsx
interface ProjectBoardProps {
  projectId: string
  buckets: Bucket[]
  tasks: Task[]
}
```

Features:
- Drag-drop with `@dnd-kit`
- Optimistic updates
- Real-time sync via Socket.IO
- Add task inline
- Bucket management

### ProjectGrid (`features/projects/components/project-grid.tsx`)
```tsx
interface ProjectGridProps {
  projectId: string
  tasks: Task[]
}
```

SVAR DataGrid configuration:
```typescript
const columns = [
  { id: 'title', header: 'Title', editor: 'text' },
  { id: 'assignees', header: 'Assignees', editor: 'multiselect' },
  { id: 'status', header: 'Status', editor: 'select' },
  { id: 'priority', header: 'Priority', editor: 'select' },
  { id: 'dueDate', header: 'Due Date', editor: 'date' },
  { id: 'progress', header: 'Progress', editor: 'slider' },
]
```

### ProjectGantt (`features/projects/components/project-gantt.tsx`)
```tsx
interface ProjectGanttProps {
  projectId: string
  tasks: Task[]
}
```

SVAR Gantt configuration:
```typescript
const ganttConfig = {
  scales: ['day', 'week', 'month'],
  columns: ['text', 'start', 'end', 'duration'],
  links: true, // Task dependencies
  baselines: true,
}
```

### TaskModal (`features/projects/components/task-modal.tsx`)

Full task editor with:
- **Title** - Text input
- **Description** - Rich text editor
- **Assignees** - Multi-select with avatars
- **Labels** - Color-coded chips
- **Priority** - Dropdown (Low, Medium, High, Critical)
- **Status** - Dropdown (To Do, In Progress, Review, Done)
- **Progress** - Slider (0-100%)
- **Start Date** - Date picker
- **Due Date** - Date picker
- **Checklist** - Nested items with checkboxes
- **Attachments** - File upload
- **Comments** - Thread-style comments
- **Dependencies** - Link to other tasks

### TaskCard (`features/projects/components/task-card.tsx`)

Compact card for board view:
- Task title
- Assignee avatars (max 3, +N)
- Label chips
- Due date badge
- Priority indicator
- Progress bar
- Comment count
- Attachment count

## Real-time Updates (FE-12)

### Domain Events (Standardized)
```typescript
// Client listens via useProjectTaskEvents(projectId)
socket.on('project:task_created', (event: ProjectTaskEvent) => {})
socket.on('project:task_updated', (event: ProjectTaskEvent) => {})
socket.on('project:task_moved', (event: ProjectTaskEvent) => {})
socket.on('project:task_deleted', (event: ProjectTaskEvent) => {})
```

### Event Reconciliation
**`useProjectTaskEvents(projectId, enabled)`**
- Automatically updates TanStack Query cache
- Syncs across all views (Board, Grid, Gantt, Schedule)
- Latency: <1s across all connected clients

### Optimistic Updates with Rollback (FE-13)

**`useMoveTask(projectId)`**
```typescript
const { mutate: moveTask } = useMoveTask(projectId)
moveTask({ 
  taskId, 
  toBucketId, 
  orderIndex 
})
// Optimistic update → API call → Rollback on error
```

**`useReorderTasks(projectId)`**
```typescript
const { mutate: reorder } = useReorderTasks(projectId)
reorder({ 
  bucketId, 
  taskIds: ['task-1', 'task-2', 'task-3'] 
})
// Preserves order with optimistic UI
```

### Timezone Handling (FE-13)

All dates use ISO 8601 with timezone (TIMESTAMPTZ):
```typescript
import { formatInUserTimezone, toUserTimezone } from '@/lib/utils/timezone'

// Display in user's timezone
formatInUserTimezone(task.dueDate, 'MMM d, yyyy h:mm a')

// Convert for editing
const localDate = toUserTimezone(task.dueDate)
```

**Utilities Available:**
- `getUserTimezone()` - Get browser timezone
- `formatDate()`, `formatDateTime()`, `formatTime()`
- `getRelativeTime()` - "2 hours ago", "in 3 days"
- `toUTCISOString()` - Convert local to UTC

## State Management

### ProjectsStore (`lib/stores/projects-store.ts`)
```typescript
interface ProjectsState {
  projects: Map<string, Project>
  tasks: Map<string, Task>
  activeProject: string | null
  activeView: 'board' | 'grid' | 'gantt' | 'schedule' | 'charts'
  
  setProjects(projects: Project[]): void
  addTask(task: Task): void
  updateTask(taskId: string, updates: Partial<Task>): void
  moveTask(taskId: string, toBucketId: string): void
  setActiveView(view: string): void
}
```

## API Endpoints

### GET `/api/projects`
List user's projects

### POST `/api/projects`
Create new project

### GET `/api/projects/[projectId]`
Project details with buckets

### GET `/api/projects/[projectId]/tasks`
All tasks for project

### POST `/api/projects/[projectId]/tasks`
Create new task

### PATCH `/api/projects/[projectId]/tasks/[taskId]`
Update task

### DELETE `/api/projects/[projectId]/tasks/[taskId]`
Delete task

### POST `/api/projects/[projectId]/buckets`
Create bucket

## Features

### Task Dependencies
- Link tasks with predecessor/successor relationships
- Gantt view shows dependency arrows
- Auto-adjust dates when dependency changes
- Prevent circular dependencies

### Checklist
- Nested checklist items
- Drag to reorder
- Progress calculated from completed items
- Markdown support in items

### Comments
- Thread-style comments on tasks
- @mentions notify users
- Rich text formatting
- Edit/delete own comments

### Labels
- Custom labels per project
- Color picker
- Filter tasks by label
- Multiple labels per task

### Bulk Actions
- Select multiple tasks
- Bulk assign
- Bulk move
- Bulk delete
- Bulk update status/priority

## Usage Example

```tsx
import { useProjectsStore } from '@/lib/stores/projects-store'
import { ProjectBoard } from '@/features/projects/components/project-board'

function ProjectPage({ params }: { params: { projectId: string } }) {
  const { activeView, tasks } = useProjectsStore()
  const projectTasks = Array.from(tasks.values())
    .filter(t => t.projectId === params.projectId)
  
  return (
    <div className="flex h-full flex-col">
      <ViewTabs />
      {activeView === 'board' && <ProjectBoard tasks={projectTasks} />}
      {activeView === 'grid' && <ProjectGrid tasks={projectTasks} />}
      {activeView === 'gantt' && <ProjectGantt tasks={projectTasks} />}
    </div>
  )
}
```

## Testing

### E2E Tests (`e2e/projects.spec.ts`)
- Create project
- Add task
- Drag task between buckets
- Verify real-time update on second client
- Edit task in modal
- Add checklist item
- Upload attachment
