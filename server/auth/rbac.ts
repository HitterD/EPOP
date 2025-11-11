export type Role = 'admin' | 'member' | 'guest'

export interface RbacDecision {
  allow: boolean
  reason?: string
}

export function requireRole(userRole: Role | undefined, required: Role): RbacDecision {
  if (!userRole) return { allow: false, reason: 'No role found' }
  const order: Role[] = ['guest', 'member', 'admin']
  if (order.indexOf(userRole) < order.indexOf(required)) {
    return { allow: false, reason: `Requires role ${required}` }
  }
  return { allow: true }
}

export function reasonHint(action: string, required: Role): string {
  return `${action} requires ${required} role`
}
