import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { InitUploadSchema } from '@/server/schemas'
import { uploadSessions } from '@/server/files/upload'

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = InitUploadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid init payload' } }, { status: 400 })

  const { fileName, fileSize, mimeType } = parsed.data
  const chunkSize = parsed.data.chunkSize ?? 8 * 1024 * 1024
  const uploadId = randomUUID()

  const session = uploadSessions.create({ uploadId, chunkSize, fileName, fileSize, mimeType })
  return NextResponse.json({ success: true, data: { uploadId: session.uploadId, chunkSize: session.chunkSize } })
}
