import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { Task } from '@/types'
import { CursorQuerySchema } from '@/lib/chat/schemas'
import { getIdempotent, setIdempotent } from '@/lib/server/idempotency'

export async function GET(req: NextRequest, { params }: { params: { projectId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const url = new URL(req.url)
  const parsed = CursorQuerySchema.safeParse({
    cursor: url.searchParams.get('cursor') || undefined,
    limit: url.searchParams.get('limit') || undefined,
  })
  if (!parsed.success)
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid pagination params' } }, { status: 400 })
  const { cursor, limit = 100 } = parsed.data
  const all = db.getProjectTasks(params.projectId)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const startIndex = cursor ? all.findIndex((t) => t.createdAt === cursor) + 1 : 0
  const items = all.slice(startIndex, startIndex + limit)
  const nextCursor = items.length === limit ? items[items.length - 1]?.createdAt : undefined
  return NextResponse.json({ success: true, data: { items, nextCursor, hasMore: Boolean(nextCursor) } })
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const idempKey = headers().get('Idempotency-Key') || undefined
  if (idempKey) {
    const cached = getIdempotent(idempKey)
    if (cached) return NextResponse.json(cached.body as object, { status: cached.status })
  }
  const body = await request.json()
  const now = new Date().toISOString()
  const task: Task = {
    id: `task-${Date.now()}`,
    projectId: params.projectId,
    bucketId: body.bucketId,
    title: body.title,
    description: body.description || '',
    assigneeIds: body.assigneeIds || [userId],
    labels: body.labels || [],
    priority: body.priority || 'medium',
    status: body.status || 'todo',
    progress: body.progress ?? 0,
    startDate: body.startDate,
    dueDate: body.dueDate,
    checklist: body.checklist || [],
    attachments: body.attachments || [],
    comments: [],
    dependencies: [],
    order: 0,
    createdAt: now,
    updatedAt: now,
  }
  const created = db.createTask(task)
  const resBody = { success: true, data: created }
  if (idempKey) setIdempotent(idempKey, 200, resBody)
  return NextResponse.json(resBody)
}
