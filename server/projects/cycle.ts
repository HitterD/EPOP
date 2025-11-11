import type { Task } from '@/types'

/**
 * Detect cycle in dependency graph.
 * Edges are A -> B meaning A depends on B (A cannot start until B completes).
 */
export function hasCycle(tasks: Task[], edges: Array<[string, string]>): boolean {
  const adj = new Map<string, string[]>()
  const ids = new Set<string>(tasks.map((t) => t.id))

  for (const [from, to] of edges) {
    if (!ids.has(from) || !ids.has(to)) continue
    const arr = adj.get(from) || []
    arr.push(to)
    adj.set(from, arr)
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()

  const dfs = (u: string): boolean => {
    if (visiting.has(u)) return true
    if (visited.has(u)) return false
    visiting.add(u)
    const nbrs = adj.get(u) || []
    for (const v of nbrs) {
      if (dfs(v)) return true
    }
    visiting.delete(u)
    visited.add(u)
    return false
  }

  for (const t of ids) {
    if (!visited.has(t)) {
      if (dfs(t)) return true
    }
  }
  return false
}
