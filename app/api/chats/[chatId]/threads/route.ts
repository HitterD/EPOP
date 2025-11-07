import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { generateId } from '@/lib/utils'

export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const parentId = searchParams.get('parentId')
  if (!parentId) return NextResponse.json({ success: true, data: [] })
  const list = db.getThread(parentId)
  return NextResponse.json({ success: true, data: list })
}

export async function POST(request: NextRequest, { params }: { params: { chatId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })
  const { parentId, content } = await request.json()
  if (!parentId || !content) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing parentId or content' } }, { status: 400 })
  const msg = db.addThreadMessage(parentId, {
    id: generateId(),
    chatId: params.chatId,
    senderId: userId,
    content,
    type: 'text',
    reactions: [],
    isEdited: false,
    isDeleted: false,
    readBy: [userId],
    deliveryPriority: 'normal',
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return NextResponse.json({ success: true, data: msg })
}
