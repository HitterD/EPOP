import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { getIdempotent, setIdempotent } from '@/lib/server/idempotency'
import { SOCKET_EVENTS } from '@/lib/constants'
import { emitToRoom } from '@/lib/server/io'

export async function POST(
  _request: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })

  const idempKey = headers().get('Idempotency-Key') || undefined
  if (idempKey) {
    const cached = getIdempotent(idempKey)
    if (cached) return NextResponse.json(cached.body as object, { status: cached.status })
  }

  const updated = db.markMessageRead(params.chatId, params.messageId, userId)
  if (!updated)
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Message not found' } }, { status: 404 })

  const now = new Date().toISOString()
  emitToRoom(`chat:${params.chatId}`, SOCKET_EVENTS.CHAT_MESSAGE_UPDATED, {
    eventType: SOCKET_EVENTS.CHAT_MESSAGE_UPDATED,
    ids: [params.messageId],
    chatId: params.chatId,
    messageId: params.messageId,
    patch: { id: params.messageId, readBy: updated.readBy, readCount: updated.readBy.length },
    timestamp: now,
    actorId: userId,
  })

  const resBody = { success: true }
  if (idempKey) setIdempotent(idempKey, 200, resBody)
  return NextResponse.json(resBody)
}
