import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { z } from 'zod'
import { SOCKET_EVENTS } from '@/lib/constants'
import { emitToRoom } from '@/lib/server/io'

const EditSchema = z.object({ content: z.string().min(1) })

export async function PATCH(
  request: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })

  const body = await request.json()
  const parsed = EditSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload' } }, { status: 400 })

  const now = new Date().toISOString()
  const updated = db.updateMessage(params.chatId, params.messageId, { content: parsed.data.content, isEdited: true, editedAt: now })
  if (!updated)
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Message not found' } }, { status: 404 })

  emitToRoom(`chat:${params.chatId}`, SOCKET_EVENTS.CHAT_MESSAGE_UPDATED, {
    eventType: SOCKET_EVENTS.CHAT_MESSAGE_UPDATED,
    ids: [params.messageId],
    chatId: params.chatId,
    messageId: params.messageId,
    patch: { id: params.messageId, content: updated.content, isEdited: true, editedAt: now },
    timestamp: now,
    actorId: userId,
  })

  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })

  const updated = db.updateMessage(params.chatId, params.messageId, { isDeleted: true })
  if (!updated)
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Message not found' } }, { status: 404 })

  const now = new Date().toISOString()
  emitToRoom(`chat:${params.chatId}`, SOCKET_EVENTS.CHAT_MESSAGE_DELETED, {
    eventType: SOCKET_EVENTS.CHAT_MESSAGE_DELETED,
    ids: [params.messageId],
    chatId: params.chatId,
    messageId: params.messageId,
    patch: {},
    timestamp: now,
    actorId: userId,
  })

  return NextResponse.json({ success: true })
}
