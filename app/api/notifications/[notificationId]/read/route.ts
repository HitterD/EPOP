import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

export async function PATCH(_req: NextRequest, { params }: { params: { notificationId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })
  const ok = db.markNotificationRead(userId, params.notificationId)
  if (!ok) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } }, { status: 404 })
  return NextResponse.json({ success: true })
}
