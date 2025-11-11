import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ChunkQuerySchema } from '@/server/schemas'
import { uploadSessions } from '@/server/files/upload'

export async function PUT(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const url = new URL(req.url)
  const parsed = ChunkQuerySchema.safeParse({
    uploadId: url.searchParams.get('uploadId') || undefined,
    index: url.searchParams.get('index') || undefined,
  })
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid query' } }, { status: 400 })

  const { uploadId, index } = parsed.data
  const session = uploadSessions.get(uploadId)
  if (!session) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Upload session not found' } }, { status: 404 })

  // Read body (chunk bytes) but ignore storage in this stub; mark received
  await req.arrayBuffer()
  uploadSessions.markChunk(uploadId, index)

  return NextResponse.json({ success: true, data: { uploadId, index } })
}
