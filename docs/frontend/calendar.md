# Calendar Integration UI

## Overview

The Calendar Integration provides comprehensive scheduling and event management with multiple views (Month, Week, Day, Agenda). It aggregates events from various sources: task deadlines, project milestones, scheduled emails, and reminders.

## Features

### Wave-1 (✅ COMPLETE)
- **Multiple Views**: Month, Week, Day, Agenda
- **View Navigation**: Previous/Next/Today buttons
- **Event Display**: Visual event indicators with color coding
- **Event Types**: Tasks, Milestones, Scheduled Mail, Reminders
- **Selected Day Detail**: Click a day to see events in sidebar
- **Responsive Layout**: Adapts to different screen sizes
- **Legend**: Color-coded event type indicators

### Wave-2 (Planned)
- **Drag-to-Create**: Click and drag to create new events
- **Drag-and-Drop Reschedule**: Move events to different dates/times
- **Event CRUD Modal**: Full create/edit/delete functionality
- **Time Zone Support**: Display events in user's local timezone
- **Recurring Events**: Support for daily/weekly/monthly recurrence

### Wave-3 (Planned)
- **ICS Import/Export**: Import from external calendars, export to .ics
- **Calendar Subscriptions**: Subscribe to external calendar feeds
- **Team Calendar View**: See team members' availability
- **Conflict Detection**: Warn when scheduling overlapping events

## File Locations

```
app/(shell)/calendar/page.tsx      # Main calendar page
```

## Usage

### View Selection

Switch between views using the tabs:
- **Month**: Traditional calendar grid showing full month
- **Week**: 7-day view with hourly breakdown
- **Day**: Single day with hourly slots (24-hour format)
- **Agenda**: List view of all upcoming events

### Navigation

- **Previous/Next**: Navigate by month (Month view), week (Week view), or day (Day view)
- **Today**: Jump to current date in any view

### Event Colors

- 🔵 Blue: Project Milestones
- 🟢 Green: Tasks
- 🟣 Purple: Scheduled Mail
- 🟠 Orange: Reminders

### Creating Events (Wave-2)

Will support multiple creation methods:
1. Click "New Event" button in header
2. Click empty time slot in Week/Day view
3. Drag to select time range in Week/Day view

## Backend Contract

### Calendar Events Endpoint

```
GET /api/v1/calendar/events
Query Params:
  - startDate: ISO 8601 date
  - endDate: ISO 8601 date
  - types?: string[] - Filter by event types
  - calendarIds?: string[] - Filter by calendar

Response:
{
  events: Array<{
    id: string,
    title: string,
    description?: string,
    startDate: string,
    endDate?: string,
    type: 'task' | 'milestone' | 'mail' | 'reminder',
    allDay: boolean,
    location?: string,
    attendees?: Array<{
      userId: string,
      name: string,
      status: 'accepted' | 'declined' | 'tentative'
    }>,
    recurrence?: {
      frequency: 'daily' | 'weekly' | 'monthly',
      interval: number,
      until?: string
    },
    source: {
      type: 'task' | 'project' | 'mail' | 'manual',
      id: string
    }
  }>
}
```

### Create/Update Event

```
POST /api/v1/calendar/events
PUT /api/v1/calendar/events/:id

Body:
{
  title: string,
  description?: string,
  startDate: string,
  endDate?: string,
  type: 'task' | 'milestone' | 'mail' | 'reminder',
  allDay: boolean,
  location?: string,
  attendees?: string[],
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly',
    interval: number,
    until?: string
  }
}

Response:
{
  event: { /* Full event object */ }
}
```

### ICS Import/Export (Wave-3)

```
POST /api/v1/calendar/ics/import
Content-Type: multipart/form-data
Body: ICS file

Response:
{
  imported: number,
  events: Array<{ id: string, title: string }>
}

---

GET /api/v1/calendar/ics/feed
Query Params:
  - calendarId?: string

Response:
Content-Type: text/calendar
Body: ICS file content
```

## Component Architecture

### View State Management

```typescript
const [currentDate, setCurrentDate] = useState<Date>(new Date())
const [selectedDate, setSelectedDate] = useState<Date>(new Date())
const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
const [events, setEvents] = useState<CalendarEvent[]>([])
```

### Navigation Logic

```typescript
const handlePrevious = () => {
  if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
  else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
  else setCurrentDate(addDays(currentDate, -1))
}

const handleNext = () => {
  if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
  else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
  else setCurrentDate(addDays(currentDate, 1))
}
```

### Week View Days Calculation

```typescript
const weekDays = useMemo(() => {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 })
  const end = endOfWeek(currentDate, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}, [currentDate])
```

## Event Data Model

```typescript
interface CalendarEvent {
  id: string
  title: string
  startDate: Date
  endDate?: Date
  type: 'task' | 'milestone' | 'mail' | 'reminder'
  color: string
  description?: string
  location?: string
  allDay?: boolean
  attendees?: Attendee[]
  recurrence?: RecurrenceRule
}
```

## Time Zone Handling (Wave-2)

### User Timezone Detection

```typescript
import { formatInTimeZone } from 'date-fns-tz'

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

// Display event time in user's timezone
const displayTime = formatInTimeZone(
  event.startDate,
  userTimezone,
  'h:mm a'
)
```

### Timezone Conversion

When user creates event, store in UTC and convert for display:

```typescript
// Store in DB as UTC
const utcDate = toDate(localDate, { timeZone: userTimezone })

// Display in user's timezone
const localDate = fromZonedTime(utcDate, userTimezone)
```

## Drag and Drop (Wave-2)

### Using dnd-kit

```typescript
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'

function DraggableEvent({ event }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: event.id,
    data: event
  })
  
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      {event.title}
    </div>
  )
}

function DroppableSlot({ date, hour }) {
  const { setNodeRef } = useDroppable({
    id: `${date}-${hour}`,
    data: { date, hour }
  })
  
  return <div ref={setNodeRef} className="time-slot" />
}
```

### Reschedule Handler

```typescript
const handleDragEnd = async (event) => {
  const { active, over } = event
  if (!over) return
  
  const eventId = active.id
  const { date, hour } = over.data.current
  
  await rescheduleEvent({
    eventId,
    newStartDate: setHours(date, hour)
  })
}
```

## Accessibility

- **Keyboard Navigation**: Arrow keys to navigate dates, Enter to select
- **Focus Management**: Proper focus indicators on all interactive elements
- **Screen Reader Support**:
  - Event counts announced when switching views
  - Date navigation announced
  - ARIA labels on all buttons and controls
- **High Contrast**: Event colors meet WCAG AA contrast requirements

## Performance Optimizations

### Memoized Calculations

```typescript
// Only recalculate when currentDate changes
const weekDays = useMemo(() => {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 })
  const end = endOfWeek(currentDate, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}, [currentDate])

// Cache filtered events
const visibleEvents = useMemo(() => {
  return events.filter(event => 
    isWithinInterval(event.startDate, { start: viewStart, end: viewEnd })
  )
}, [events, viewStart, viewEnd])
```

### Lazy Loading

Load events only for visible date range:

```typescript
useEffect(() => {
  const fetchEvents = async () => {
    const events = await getCalendarEvents({
      startDate: viewStart,
      endDate: viewEnd
    })
    setEvents(events)
  }
  
  fetchEvents()
}, [view, currentDate])
```

## Testing

### Unit Tests

```typescript
describe('Calendar navigation', () => {
  it('navigates to next month', () => {
    const { result } = renderHook(() => useCalendar())
    const initialMonth = result.current.currentDate.getMonth()
    
    act(() => result.current.handleNext())
    
    expect(result.current.currentDate.getMonth()).toBe(initialMonth + 1)
  })
  
  it('filters events by date', () => {
    const events = [
      { startDate: new Date('2024-01-15'), title: 'Event 1' },
      { startDate: new Date('2024-02-15'), title: 'Event 2' }
    ]
    
    const filtered = getEventsForDay(events, new Date('2024-01-15'))
    expect(filtered).toHaveLength(1)
  })
})
```

### E2E Tests

```typescript
test('Calendar view switching', async ({ page }) => {
  await page.goto('/calendar')
  
  // Default to month view
  await expect(page.locator('[data-testid="month-view"]')).toBeVisible()
  
  // Switch to week view
  await page.click('[data-testid="tab-week"]')
  await expect(page.locator('[data-testid="week-view"]')).toBeVisible()
  
  // Check navigation
  await page.click('[data-testid="btn-next"]')
  // Week should advance by 7 days
})
```

## Integration Points

### Task System
- Task due dates automatically appear as events
- Task status updates reflected in calendar
- Click task event to navigate to task detail

### Project Milestones
- Project milestones show as special events
- Color-coded by project
- Click to open project Gantt chart

### Mail Scheduler
- Scheduled send times appear as events
- Preview email content from calendar
- Reschedule send time via drag-and-drop

## Future Enhancements

### Wave-4+
- **Meeting Rooms**: Book physical/virtual meeting rooms
- **Availability Sharing**: Share free/busy status with external parties
- **Calendar Syncing**: Two-way sync with Google Calendar, Outlook
- **Smart Scheduling**: AI-powered meeting time suggestions
- **Calendar Analytics**: Time spent in meetings, task completion trends

## Related Documentation

- [Projects Gantt Chart](./projects-gantt.md)
- [Date/Time Utilities](./utilities.md)
- [dnd-kit Integration](./drag-drop.md)
