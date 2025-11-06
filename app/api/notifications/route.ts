import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { Notification } from '@/types'

export async function GET() {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const list = db.getNotifications(userId)
  return NextResponse.json({ success: true, data: list })
}

export async function POST(request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const body = await request.json()
  const notif: Notification = {
    id: `notif-${Date.now()}`,
    userId,
    type: body.type || 'system',
    title: body.title || 'Notification',
    message: body.message || '',
    actionUrl: body.actionUrl,
    isRead: false,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
  const created = db.addNotification(notif)
  return NextResponse.json({ success: true, data: created })
}
