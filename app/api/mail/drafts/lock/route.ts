import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { DraftLockSchema } from '@/server/mail/schemas'
import { draftStore } from '@/server/mail/drafts'

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = DraftLockSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload' } }, { status: 400 })

  const { draftId, tabId } = parsed.data
  const res = draftStore.acquireLock(draftId, tabId)
  return NextResponse.json({ success: true, data: res })
}
