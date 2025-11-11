import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { getIdempotent, setIdempotent } from '@/lib/server/idempotency'
import { validateStatusChange } from '@/server/projects/wip'

export async function PATCH(request: NextRequest, { params }: { params: { projectId: string; taskId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const idempKey = headers().get('Idempotency-Key') || undefined
  if (idempKey) {
    const cached = getIdempotent(idempKey)
    if (cached) return NextResponse.json(cached.body as object, { status: cached.status })
  }

  const body = await request.json()
  const toBucketId: string | undefined = body?.bucketId
  const orderIndex: number = Number.isInteger(body?.orderIndex) ? body.orderIndex : 0
  if (!toBucketId)
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'bucketId is required' } }, { status: 400 })

  // If move implies a status change (by bucket), validate via WIP guard when possible
  const userId = accessToken.split('_')[1]
  const user = userId ? db.getUser(userId) : undefined
  const currentTask = db.getTask(params.taskId)
  if (currentTask) {
    // Infer status mapping by bucket name if available (best-effort heuristic)
    const buckets = db.getBuckets(params.projectId)
    const toBucket = buckets.find((b) => b.id === toBucketId)
    const fromBucket = buckets.find((b) => b.id === currentTask.bucketId)
    const toStatus = toBucket?.name?.toLowerCase().includes('review')
      ? 'review'
      : toBucket?.name?.toLowerCase().includes('progress')
      ? 'in_progress'
      : toBucket?.name?.toLowerCase().includes('done')
      ? 'done'
      : 'todo'
    const fromStatus = currentTask.status
    if (toStatus && toStatus !== fromStatus) {
      const tasks = db.getProjectTasks(params.projectId)
      const res = validateStatusChange(tasks, fromStatus, toStatus, user?.role === 'admin')
      if (!res.allowed) {
        return NextResponse.json({ success: false, error: { code: 'WIP_LIMIT', message: res.reason || 'WIP limit/transition blocked' } }, { status: 400 })
      }
    }
  }

  const moved = db.moveTask(params.projectId, params.taskId, toBucketId, orderIndex)
  if (!moved)
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task or project not found' } }, { status: 404 })

  const resBody = { success: true, data: moved }
  if (idempKey) setIdempotent(idempKey, 200, resBody)
  return NextResponse.json(resBody)
}
