import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

export async function GET(_req: NextRequest, { params }: { params: { chatId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const chat = db.getChat(params.chatId)
  if (!chat) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Chat not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: chat })
}
