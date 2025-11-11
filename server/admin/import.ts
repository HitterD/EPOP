import { auditLog } from '@/server/audit/log'
import { db } from '@/lib/db/mock-data'

export interface ImportPreviewResult {
  total: number
  valid: number
  invalid: number
  columns: string[]
  mapping: Record<string, string>
  rows: Array<{ row: number; isValid: boolean; data: Record<string, unknown>; errors?: string[] }>
}

interface BatchRecord {
  batchId: string
  createdUserIds: string[]
}

class ImportService {
  private lastBatch: BatchRecord | null = null

  detectColumns(rows: Array<Record<string, unknown>>): string[] {
    const set = new Set<string>()
    for (const r of rows) Object.keys(r || {}).forEach((k) => set.add(k))
    return Array.from(set)
  }

  suggestMapping(columns: string[]): Record<string, string> {
    const map: Record<string, string> = {}
    for (const c of columns) {
      const lc = c.toLowerCase()
      if (lc.includes('email')) map[c] = 'email'
      else if (lc.includes('name')) map[c] = 'name'
      else if (lc.includes('title')) map[c] = 'title'
      else if (lc.includes('department')) map[c] = 'department'
    }
    return map
  }

  dryRun(rows: Array<Record<string, unknown>>, mapping?: Record<string, string>): ImportPreviewResult {
    const columns = this.detectColumns(rows)
    const mappingUsed = mapping && Object.keys(mapping).length ? mapping : this.suggestMapping(columns)

    let valid = 0
    let invalid = 0
    const outRows: ImportPreviewResult['rows'] = []

    rows.forEach((row, i) => {
      const name = row[mappingUsed['name'] || 'name'] as string | undefined
      const email = row[mappingUsed['email'] || 'email'] as string | undefined
      const errors: string[] = []
      if (!name || typeof name !== 'string') errors.push('name required')
      if (!email || typeof email !== 'string' || !email.includes('@')) errors.push('email invalid')
      const isValid = errors.length === 0
      if (isValid) valid++; else invalid++
      outRows.push({ row: i + 1, isValid, data: row, errors: errors.length ? errors : undefined })
    })

    return { total: rows.length, valid, invalid, columns, mapping: mappingUsed, rows: outRows }
  }

  commit(preview: ImportPreviewResult): { batchId: string; created: number } {
    const createdUserIds: string[] = []
    for (const r of preview.rows) {
      if (!r.isValid) continue
      const email = String(r.data[preview.mapping['email'] || 'email'])
      const name = String(r.data[preview.mapping['name'] || 'name'])
      const existing = db.getUserByEmail(email)
      if (existing) continue
      const now = new Date().toISOString()
      const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      db.createUser({
        id,
        email,
        name,
        role: 'member',
        permissions: [],
        presence: 'available',
        createdAt: now,
        updatedAt: now,
      } as any)
      createdUserIds.push(id)
    }
    const batchId = `import-${Date.now()}`
    this.lastBatch = { batchId, createdUserIds }
    auditLog.append({ action: 'admin_import_commit', actorId: 'system', target: batchId, details: `created=${createdUserIds.length}` })
    return { batchId, created: createdUserIds.length }
  }

  undoLast(): { undone: number } {
    const lb = this.lastBatch
    if (!lb) return { undone: 0 }
    let undone = 0
    for (const id of lb.createdUserIds) {
      const ok = db.deleteUser(id)
      if (ok) undone++
    }
    auditLog.append({ action: 'admin_import_undo', actorId: 'system', target: lb.batchId, details: `undone=${undone}` })
    this.lastBatch = null
    return { undone }
  }
}

export const importService = new ImportService()
