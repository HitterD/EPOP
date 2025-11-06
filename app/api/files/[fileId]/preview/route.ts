import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

export async function GET(_req: NextRequest, { params }: { params: { fileId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const file = db.getFile(params.fileId)
  if (!file) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } }, { status: 404 })
  // Stub: return original URL as preview
  return NextResponse.json({ success: true, data: { thumbnailUrl: file.thumbnailUrl || file.url } })
}
