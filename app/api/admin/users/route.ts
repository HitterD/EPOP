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

export async function GET() {
  const guard = requireAdmin()
  if (!guard.ok) return NextResponse.json(guard.body!, { status: guard.status })
  const users = db.getAllUsers()
  return NextResponse.json({ success: true, data: users })
}

export async function POST(request: NextRequest) {
  const guard = requireAdmin()
  if (!guard.ok) return NextResponse.json(guard.body!, { status: guard.status })
  const body = await request.json()
  const now = new Date().toISOString()
  const user: User = {
    id: body.id || `user-${Date.now()}`,
    email: body.email,
    name: body.name,
    role: body.role || 'member',
    permissions: body.permissions || [],
    presence: 'offline',
    createdAt: now,
    updatedAt: now,
  }
  const created = db.createUser(user)
  return NextResponse.json({ success: true, data: created })
}
