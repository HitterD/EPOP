import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

export async function PATCH(request: NextRequest, { params }: { params: { messageId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const body = await request.json()
  const folder = body?.folder as 'received' | 'sent' | 'deleted' | undefined
  if (!folder)
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing folder' } }, { status: 400 })
  const updated = db.moveMail(params.messageId, folder)
  if (!updated)
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Message not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}
