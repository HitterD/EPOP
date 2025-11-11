import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ScanStatusSchema } from '@/server/mail/schemas'
import { scanStore } from '@/server/mail/scan'

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = ScanStatusSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload' } }, { status: 400 })

  const { messageId, results } = parsed.data
  scanStore.set(messageId, results)
  return NextResponse.json({ success: true })
}
