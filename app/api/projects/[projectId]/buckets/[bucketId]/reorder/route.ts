import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { getIdempotent, setIdempotent } from '@/lib/server/idempotency'

export async function POST(request: NextRequest, { params }: { params: { projectId: string; bucketId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const idempKey = headers().get('Idempotency-Key') || undefined
  if (idempKey) {
    const cached = getIdempotent(idempKey)
    if (cached) return NextResponse.json(cached.body as object, { status: cached.status })
  }

  const body = await request.json()
  const taskIds: string[] = Array.isArray(body?.taskIds) ? body.taskIds : []
  if (!taskIds.length)
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'taskIds[] required' } }, { status: 400 })

  const ok = db.reorderBucketTasks(params.projectId, params.bucketId, taskIds)
  if (!ok)
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Project/bucket not found' } }, { status: 404 })

  const resBody = { success: true }
  if (idempKey) setIdempotent(idempKey, 200, resBody)
  return NextResponse.json(resBody)
}
