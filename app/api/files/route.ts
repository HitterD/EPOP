import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { FileItem } from '@/types'

export async function GET() {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const files = db.getAllFiles()
  return NextResponse.json({ success: true, data: files })
}

export async function POST(request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })
  const body = await request.json()
  const now = new Date().toISOString()
  const uploader = db.getUser(userId)
  const file: FileItem = {
    id: `file-${Date.now()}`,
    name: body.name,
    size: body.size || 0,
    mimeType: body.mimeType || 'application/octet-stream',
    url: body.url || `/uploads/${body.name}`,
    thumbnailUrl: body.thumbnailUrl,
    uploadedBy: uploader
      ? { id: uploader.id, name: uploader.name, ...(uploader.avatar ? { avatar: uploader.avatar } : {}) }
      : { id: userId, name: 'Unknown' },
    status: 'ready',
    context: body.context,
    createdAt: now,
    updatedAt: now,
  }
  const created = db.createFile(file)
  return NextResponse.json({ success: true, data: created })
}
