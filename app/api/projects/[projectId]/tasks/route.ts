import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { Task } from '@/types'

export async function GET(_req: NextRequest, { params }: { params: { projectId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const tasks = db.getProjectTasks(params.projectId)
  return NextResponse.json({ success: true, data: tasks })
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
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
  return NextResponse.json({ success: true, data: created })
}
