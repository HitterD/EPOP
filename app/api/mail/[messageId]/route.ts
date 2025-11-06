import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

export async function GET(_req: NextRequest, { params }: { params: { messageId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const msg = db.getMail(params.messageId)
  if (!msg) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Message not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: msg })
}

export async function PATCH(request: NextRequest, { params }: { params: { messageId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const body = await request.json()
  if (typeof body.isRead === 'boolean') {
    const updated = db.setMailRead(params.messageId, body.isRead)
    if (!updated) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Message not found' } }, { status: 404 })
    return NextResponse.json({ success: true, data: updated })
  }
  const folder = body.folder
  if (!folder) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing folder or isRead' } }, { status: 400 })
  const updated = db.moveMail(params.messageId, folder)
  if (!updated) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Message not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: { messageId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const updated = db.moveMail(params.messageId, 'deleted')
  if (!updated) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Message not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}
