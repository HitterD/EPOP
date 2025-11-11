import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CursorQuerySchema } from '@/server/schemas'
import { chatEvents } from '@/server/chat/events'

export async function GET(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const url = new URL(req.url)
  const parsed = CursorQuerySchema.safeParse({ cursor: url.searchParams.get('cursor') || undefined })
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid cursor' } }, { status: 400 })

  const cursor = parsed.data.cursor || 0
  const events = chatEvents.since(cursor)
  const latest = events.length ? events[events.length - 1].serverTimestamp : cursor

  return NextResponse.json({ success: true, data: { events, latestCursor: latest } })
}
