# Projects Gantt (Timeline) — Frontend

## Overview
We implement a customizable, accessible Gantt-style timeline for Projects using a lightweight custom rendering first, with an option to evolve to visx for pan/zoom/brush. This keeps the bundle small and avoids paid libraries.

- Approach: Custom Timeline (CSS + date-fns) with an upgrade path to visx.
- Why: Full control over a11y and keyboard navigation; predictable performance and bundle size.
- Real-time: Sync via Socket.IO events `project.task.created` and `project.task.moved`.

## Files
- `features/projects/components/project-gantt-view.tsx` (Gantt view)
- `app/(shell)/projects/[projectId]/timeline/page.tsx` (route, dynamically loaded)

## Data Model
Tasks are rendered when both `startDate` and `dueDate` exist.

```ts
interface Task {
  id: string
  title: string
  startDate: string // ISO
  dueDate: string // ISO
  progress: number // 0-100
}
```

Timeline range derives from min(startDate) and max(dueDate), expanded to whole months.

## Accessibility (a11y)
- Roles: `role="list"` for rows and `role="listitem"` for each task bar container.
- Labels: Each task bar exposes `aria-label` with title, date range, and progress.
- Focus: Task bars focusable with `tabIndex={0}` and visible focus ring.
- Live regions: Changes to task updates can be announced via `aria-live="polite"` in a status region.

Keyboard map (initial):
- Left/Right: Move focused task start/end by 1 day (with modifier Ctrl/Alt to adjust end vs start).
- Shift+Left/Right: Resize duration by 1 day.
- Enter: Open details.

Note: Keyboard handlers are planned for Wave-2 a11y hardening.

## Performance
- Dynamic import for the timeline route to avoid impacting LCP of other pages.
- Minimal re-renders via `useMemo` for derived layout, constant-time style computation for each row.
- Virtualization not required at typical task counts (<200), but can be added later if needed.

## Real-time Sync
- Listen for `project.task.moved` and `project.task.created` to refresh timeline slice.
- Optimistic UI for drag/move with rollback on error (TanStack Query pattern consistent with Grid/Board).

## Future: visx Upgrade Path
If we need zoom/pan/brush or thousands of tasks:
- Use `@visx/scale` (`scaleTime`) for x-axis.
- Add `@visx/axis` for tick rendering.
- Add brush region for range selection and overview.
- Keep the same a11y and keyboard strategy.

## Acceptance Criteria
- Timeline shows all tasks with dates, colored by status (overdue, in-progress, completed).
- Bars have clear focus state, tooltips/titles, and screen-reader-friendly labels.
- Dynamic import active; no regression in route LCP/CLS/INP targets.
- Ready for Wave-2 keyboard/a11y enhancements and Wave-3 real-time reconciliation.
