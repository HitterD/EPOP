import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import type { User } from '@/types'

function requireAdmin(): { ok: boolean; status?: number; body?: object } {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return { ok: false, status: 401, body: { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } } }
  const userId = accessToken.split('_')[1]
  const me = db.getUser(userId!)
  if (!me || me.role !== 'admin') return { ok: false, status: 403, body: { success: false, error: { code: 'FORBIDDEN', message: 'Admin only' } } }
  return { ok: true }
}

export async function GET(_req: NextRequest, { params }: { params: { userId: string } }) {
  const guard = requireAdmin()
  if (!guard.ok) return NextResponse.json(guard.body!, { status: guard.status })
  const u = db.getUser(params.userId)
  if (!u) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: u })
}

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  const guard = requireAdmin()
  if (!guard.ok) return NextResponse.json(guard.body!, { status: guard.status })
  const updates = (await req.json()) as Partial<User>
  const updated = db.updateUser(params.userId, updates)
  if (!updated) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: { userId: string } }) {
  const guard = requireAdmin()
  if (!guard.ok) return NextResponse.json(guard.body!, { status: guard.status })
  const ok = db.deleteUser(params.userId)
  if (!ok) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }, { status: 404 })
  return NextResponse.json({ success: true })
}
