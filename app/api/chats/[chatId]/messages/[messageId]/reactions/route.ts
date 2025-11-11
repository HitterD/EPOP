import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { AddReactionSchema } from '@/lib/chat/schemas'
import { getIdempotent, setIdempotent } from '@/lib/server/idempotency'
import { SOCKET_EVENTS } from '@/lib/constants'
import { emitToRoom } from '@/lib/server/io'

export async function POST(
  request: NextRequest,
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

  const body = await request.json()
  const parsed = AddReactionSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload' } }, { status: 400 })

  db.addReaction(params.chatId, params.messageId, parsed.data.emoji, userId)

  const now = new Date().toISOString()
  emitToRoom(`chat:${params.chatId}`, SOCKET_EVENTS.CHAT_REACTION_ADDED, {
    eventType: SOCKET_EVENTS.CHAT_REACTION_ADDED,
    ids: [params.messageId],
    chatId: params.chatId,
    messageId: params.messageId,
    patch: { reactionsSummary: [] },
    timestamp: now,
    actorId: userId,
  })

  const resBody = { success: true }
  if (idempKey) setIdempotent(idempKey, 200, resBody)
  return NextResponse.json(resBody)
}
