import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { generateId } from '@/lib/utils'
import { CreateMessageSchema, CursorQuerySchema } from '@/lib/chat/schemas'
import { setIdempotent, getIdempotent } from '@/lib/server/idempotency'
import { SOCKET_EVENTS } from '@/lib/constants'
import { emitToRoom } from '@/lib/server/io'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const accessToken = cookies().get('accessToken')?.value
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const parsed = CursorQuerySchema.safeParse({
      cursor: url.searchParams.get('cursor') || undefined,
      limit: url.searchParams.get('limit') || undefined,
    })
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid pagination params' } },
        { status: 400 }
      )
    }
    const { cursor, limit = 50 } = parsed.data

    const all = db.getChatMessages(params.chatId)
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const startIndex = cursor ? all.findIndex((m) => m.createdAt === cursor) + 1 : 0
    const items = all.slice(startIndex, startIndex + limit)
    const nextCursor = items.length === limit ? items[items.length - 1]?.createdAt : undefined

    return NextResponse.json({
      success: true,
      data: { items, nextCursor, hasMore: Boolean(nextCursor) },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const accessToken = cookies().get('accessToken')?.value
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const userId = accessToken.split('_')[1]
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      )
    }

    // Idempotency
    const idempKey = headers().get('Idempotency-Key') || undefined
    if (idempKey) {
      const cached = getIdempotent(idempKey)
      if (cached) {
        return NextResponse.json(cached.body as object, { status: cached.status })
      }
    }

    const body = await request.json()
    const parsed = CreateMessageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid message payload' } },
        { status: 400 }
      )
    }
    const { id, content, deliveryPriority, threadId } = parsed.data as { id?: string; content: string; deliveryPriority: 'normal'|'important'|'urgent'; threadId?: string }

    const now = new Date().toISOString()
    const base = {
      id: id || generateId(),
      chatId: params.chatId,
      senderId: userId,
      content,
      type: 'text' as const,
      reactions: [],
      isEdited: false,
      isDeleted: false,
      readBy: [userId],
      deliveryPriority,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    }
    const newMessage = threadId ? db.addThreadMessage(threadId, base) : db.addMessage(base)

    // Broadcast domain event to chat room
    emitToRoom(`chat:${params.chatId}`, SOCKET_EVENTS.CHAT_MESSAGE_CREATED, {
      eventType: SOCKET_EVENTS.CHAT_MESSAGE_CREATED,
      ids: [newMessage.id],
      chatId: params.chatId,
      messageId: newMessage.id,
      patch: newMessage,
      timestamp: now,
      actorId: userId,
    })

    const resBody = { success: true, data: newMessage }
    if (idempKey) setIdempotent(idempKey, 200, resBody)
    return NextResponse.json(resBody)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
