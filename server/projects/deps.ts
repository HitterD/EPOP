import type { Task } from '@/types'
import { hasCycle } from './cycle'

/**
 * Utilities to apply dependency updates on tasks with cycle detection.
 */
export function updateDependencies(
  tasks: Task[],
  updates: Array<{ taskId: string; dependsOn: string[] }>
): { ok: true } | { ok: false; reason: string } {
  const byId = new Map(tasks.map((t) => [t.id, { ...t }]))

  // Apply updates in memory
  for (const u of updates) {
    const t = byId.get(u.taskId)
    if (!t) return { ok: false, reason: `Task not found: ${u.taskId}` }
    t.dependencies = [...new Set(u.dependsOn)]
    byId.set(t.id, t)
  }

  // Build edges and detect cycles
  const newTasks = Array.from(byId.values())
  const edges: Array<[string, string]> = []
  for (const t of newTasks) {
    ;(t.dependencies || []).forEach((d) => edges.push([t.id, d]))
  }
  if (hasCycle(newTasks, edges)) return { ok: false, reason: 'Dependency cycle detected' }

  return { ok: true }
}
