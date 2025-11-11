import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auditLog } from '@/server/audit/log'

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const body = await req.json().catch(() => ({} as any))
  const version = body?.version || 'unknown'

  const entry = auditLog.append({ action: 'sw_mark_updated', actorId: userId, details: `version=${version}` })
  return NextResponse.json({ success: true, data: { id: entry.id, createdAt: entry.createdAt } })
}
