import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { CompleteUploadSchema } from '@/server/schemas'
import { uploadSessions } from '@/server/files/upload'
import { contentStore } from '@/server/files/storage'

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = CompleteUploadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid completion payload' } }, { status: 400 })

  const { uploadId, sha256, totalChunks } = parsed.data
  const session = uploadSessions.complete(uploadId)
  if (!session) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Upload session not found' } }, { status: 404 })

  // Validate chunk count received (best-effort in stub)
  if (session.chunksReceived.size < totalChunks) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing chunks' } }, { status: 400 })
  }

  // Ensure content-addressed record
  const meta = contentStore.ensure(sha256, {
    fileName: session.fileName,
    fileSize: session.fileSize,
    mimeType: session.mimeType,
  })

  // Clear session (optional)
  uploadSessions.delete(uploadId)

  return NextResponse.json({ success: true, data: { sha256: meta.sha256, path: meta.path, duplicateCount: meta.duplicateCount } })
}
