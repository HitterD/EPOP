import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

export async function GET(_req: NextRequest, { params }: { params: { projectId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const buckets = db.getBuckets(params.projectId)
  return NextResponse.json({ success: true, data: buckets })
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const { name } = await request.json()
  const created = db.addBucket(params.projectId, name)
  if (!created) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: created })
}
