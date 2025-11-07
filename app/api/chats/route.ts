import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

export async function GET(request: NextRequest) {
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
    const userChats = db.getUserChats(userId)

    return NextResponse.json({
      success: true,
      data: userChats,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = cookies().get('accessToken')?.value
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const { type, name, members } = await request.json()
    const userId = accessToken.split('_')[1]
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
        { status: 401 }
      )
    }

    const newChat = db.createChat({
      id: `chat-${Date.now()}`,
      type,
      name,
      members: [userId, ...members],
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: newChat,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
