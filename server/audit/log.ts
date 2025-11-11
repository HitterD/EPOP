export interface AuditEvent {
  id: string
  action: string
  actorId: string
  target?: string
  details?: string
  createdAt: number
}

class AuditLog {
  private events: AuditEvent[] = []

  append(e: Omit<AuditEvent, 'id' | 'createdAt'>) {
    const rec: AuditEvent = { id: `audit-${Date.now()}-${Math.random()}`, createdAt: Date.now(), ...e }
    this.events.push(rec)
    return rec
  }

  list(limit = 100) {
    return this.events.slice(-limit)
  }
}

export const auditLog = new AuditLog()
