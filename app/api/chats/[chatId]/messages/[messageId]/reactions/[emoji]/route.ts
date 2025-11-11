import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { SOCKET_EVENTS } from '@/lib/constants'
import { emitToRoom } from '@/lib/server/io'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { chatId: string; messageId: string; emoji: string } }
) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })

  db.removeReaction(params.chatId, params.messageId, params.emoji, userId)

  const now = new Date().toISOString()
  emitToRoom(`chat:${params.chatId}`, SOCKET_EVENTS.CHAT_REACTION_REMOVED, {
    eventType: SOCKET_EVENTS.CHAT_REACTION_REMOVED,
    ids: [params.messageId],
    chatId: params.chatId,
    messageId: params.messageId,
    patch: {},
    timestamp: now,
    actorId: userId,
  })

  return NextResponse.json({ success: true })
}
