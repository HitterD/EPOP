import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import type { BulkImportResult, BulkImportError, User } from '@/types'

function requireAdmin(): { ok: boolean; status?: number; body?: object } {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return { ok: false, status: 401, body: { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } }
  const userId = accessToken.split('_')[1]
  const me = db.getUser(userId!)
  if (!me || me.role !== 'admin') return { ok: false, status: 403, body: { success: false, error: { code: 'FORBIDDEN', message: 'Admin only' } } }
  return { ok: true }
}

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0]!.split(',').map((h) => h.trim())
  const rows: Array<Record<string, string>> = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(',')
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => (row[h] = (cols[idx] || '').trim()))
    rows.push(row)
  }
  return rows
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin()
  if (!guard.ok) return NextResponse.json(guard.body!, { status: guard.status })

  const contentType = request.headers.get('content-type') || ''
  let rows: Array<Record<string, string>> = []
  if (contentType.includes('application/json')) {
    const body = await request.json()
    rows = Array.isArray(body?.rows) ? body.rows : []
  } else if (contentType.includes('text/csv')) {
    const text = await request.text()
    rows = parseCsv(text)
  } else {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Unsupported content-type' } }, { status: 400 })
  }

  const dryRun = (request.headers.get('x-dry-run') || '').toLowerCase() === 'true'

  const result: BulkImportResult = { total: rows.length, imported: 0, skipped: 0, errors: [] }
  const now = new Date().toISOString()

  rows.forEach((r, index) => {
    const email = r.email || r.Email || r.E_mail
    const name = r.name || r.Name
    const role = (r.role || 'member') as User['role']
    if (!email || !name) {
      const err: BulkImportError = { row: index + 1, message: 'Missing email or name', type: 'validation' }
      result.errors.push(err)
      result.skipped++
      return
    }
    if (!dryRun) {
      const user: User = {
        id: `user-${Date.now()}-${index}`,
        email,
        name,
        role,
        permissions: [],
        presence: 'offline',
        createdAt: now,
        updatedAt: now,
      }
      db.createUser(user)
      result.imported++
    }
  })

  return NextResponse.json({ success: true, data: result })
}
