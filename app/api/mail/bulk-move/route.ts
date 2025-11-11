import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { getIdempotent, setIdempotent } from '@/lib/server/idempotency'

export async function POST(request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const idempKey = headers().get('Idempotency-Key') || undefined
  if (idempKey) {
    const cached = getIdempotent(idempKey)
    if (cached) return NextResponse.json(cached.body as object, { status: cached.status })
  }
  const body = await request.json()
  const messageIds: string[] = Array.isArray(body?.messageIds) ? body.messageIds : []
  const folder: 'received' | 'sent' | 'deleted' | undefined = body?.folder
  if (!messageIds.length || !folder)
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'messageIds[] and folder are required' } }, { status: 400 })

  const results = messageIds.map((id) => db.moveMail(id, folder)).filter(Boolean)
  const resBody = { success: true, data: { moved: results.length } }
  if (idempKey) setIdempotent(idempKey, 200, resBody)
  return NextResponse.json(resBody)
}
