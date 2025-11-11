import type { Task } from '@/types'
import { WIPGuard, type TaskStatus as GuardStatus } from '@/lib/projects/wip-guard'
import { toTimezone } from '@/lib/projects/timezone'

// Map app Task.status to WIPGuard statuses
function mapStatusToGuard(status: Task['status']): GuardStatus {
  if (status === 'review') return 'in_review'
  if (status === 'in_progress') return 'in_progress'
  if (status === 'todo') return 'todo'
  if (status === 'done') return 'done'
  // Best-effort default
  return 'todo'
}

export function buildCounts(tasks: Task[]): Record<GuardStatus, number> {
  const counts: Record<GuardStatus, number> = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    in_review: 0,
    blocked: 0,
    on_hold: 0,
    done: 0,
    cancelled: 0,
  }
  for (const t of tasks) {
    const s = mapStatusToGuard(t.status)
    counts[s] = (counts[s] || 0) + 1
  }
  return counts
}

export function validateStatusChange(
  tasks: Task[],
  fromStatus: Task['status'],
  toStatus: Task['status'],
  isAdmin: boolean,
  limits?: Partial<Record<GuardStatus, number>>
): { allowed: boolean; reason?: string; requiresPermission?: boolean; canOverride?: boolean } {
  const guard = new WIPGuard(limits as any)
  const counts = buildCounts(tasks)
  for (const [k, v] of Object.entries(counts)) guard.setCount(k as GuardStatus, v as number)
  if (isAdmin) guard.enableOverride(); else guard.disableOverride()
  const res = guard.validateMove(mapStatusToGuard(fromStatus), mapStatusToGuard(toStatus))
  return res
}

export function validateDates(
  startDate?: string,
  dueDate?: string,
  timezone: string = 'UTC'
): { ok: true } | { ok: false; reason: string } {
  if (!startDate || !dueDate) return { ok: true }
  const s = toTimezone(new Date(startDate), timezone)
  const d = toTimezone(new Date(dueDate), timezone)
  if (isNaN(s.getTime()) || isNaN(d.getTime())) return { ok: false, reason: 'Invalid dates' }
  if (d.getTime() < s.getTime()) return { ok: false, reason: 'dueDate must be after or equal to startDate' }
  // Optional: clamp extreme spans (e.g., > 5 years)
  const fiveYearsMs = 5 * 365 * 24 * 60 * 60 * 1000
  if (d.getTime() - s.getTime() > fiveYearsMs) return { ok: false, reason: 'Date span too large' }
  return { ok: true }
}
