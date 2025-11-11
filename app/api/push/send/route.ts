import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { userPushLimiter } from '@/server/push/rate-limit'
import { isQuietNow } from '@/server/push/quiet-hours'

// Using the same in-memory subscription store as subscribe route
declare global {
  // eslint-disable-next-line no-var
  var __pushSubs: Map<string, any> | undefined
}

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]

  const body = await req.json().catch(() => null)
  const targetUserId = body?.userId as string | undefined
  const payload = body?.payload ?? {}
  const quietHours = body?.quietHours as { enabled?: boolean; start?: string; end?: string } | undefined

  if (!targetUserId) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'userId required' } }, { status: 400 })
  }

  if (!userPushLimiter.allow(`${userId}->${targetUserId}`)) {
    return NextResponse.json({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many push attempts' } }, { status: 429 })
  }

  if (quietHours?.enabled && isQuietNow(new Date(), { enabled: true, start: quietHours.start || '22:00', end: quietHours.end || '07:00' })) {
    // Silently drop or queue; here we ack with quiet flag
    return NextResponse.json({ success: true, data: { queued: true, quiet: true } })
  }

  const store = (globalThis as any).__pushSubs as Map<string, any> | undefined
  const sub = store?.get(targetUserId)
  if (!sub) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not subscribed' } }, { status: 404 })

  // For demo: we don't actually send a push; in production integrate web-push
  // Acknowledge as delivered
  return NextResponse.json({ success: true, data: { delivered: true, payload } })
}
