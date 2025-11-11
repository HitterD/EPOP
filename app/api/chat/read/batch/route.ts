import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ReadBatchSchema } from '@/server/schemas'
import { chatEvents } from '@/server/chat/events'

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = ReadBatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload' } }, { status: 400 })

  // Emit a consolidated read event for the batch (UI can fan-out per message if desired)
  const ev = chatEvents.append('message:read', {
    userId,
    messageIds: parsed.data.messageIds,
  })

  return NextResponse.json({ success: true, data: { eventId: ev.id, serverTimestamp: ev.serverTimestamp } })
}
