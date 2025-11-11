import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { requireRole, reasonHint } from '@/server/auth/rbac'
import { ImportRequestSchema } from '@/server/admin/schemas'
import { importService } from '@/server/admin/import'

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const user = userId ? db.getUser(userId) : undefined

  const auth = requireRole(user?.role as any, 'admin')
  if (!auth.allow) {
    return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: reasonHint('Import users', 'admin') } }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = ImportRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid import payload' } }, { status: 400 })
  }

  const { action, mapping, rows = [], skipInvalid = true } = parsed.data
  if (action === 'dry-run') {
    const preview = importService.dryRun(rows as any[], mapping)
    return NextResponse.json({ success: true, data: preview })
  }

  if (action === 'commit') {
    // For best-practice safety, recompute preview and if invalid>0 and not skipInvalid, reject
    const preview = importService.dryRun(rows as any[], mapping)
    if (!skipInvalid && preview.invalid > 0) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid rows present; run dry-run and fix or set skipInvalid=true' } }, { status: 400 })
    }
    const res = importService.commit(preview)
    return NextResponse.json({ success: true, data: res })
  }

  if (action === 'undo') {
    const res = importService.undoLast()
    return NextResponse.json({ success: true, data: res })
  }

  return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Unsupported action' } }, { status: 400 })
}
