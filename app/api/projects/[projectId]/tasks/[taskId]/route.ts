import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { validateStatusChange, validateDates } from '@/server/projects/wip'

export async function GET(_req: NextRequest, { params }: { params: { projectId: string; taskId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const task = db.getTask(params.taskId)
  if (!task) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: task })
}

export async function PATCH(request: NextRequest, { params }: { params: { projectId: string; taskId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const user = userId ? db.getUser(userId) : undefined
  const updates = await request.json()

  const existing = db.getTask(params.taskId)
  if (!existing) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 })

  // Validate status transition with WIP guard if status changes
  if (typeof updates.status === 'string' && updates.status !== existing.status) {
    const tasks = db.getProjectTasks(params.projectId)
    const res = validateStatusChange(tasks, existing.status, updates.status, user?.role === 'admin')
    if (!res.allowed) {
      return NextResponse.json({ success: false, error: { code: 'WIP_LIMIT', message: res.reason || 'WIP limit/transition blocked', ...(res.canOverride !== undefined ? { canOverride: res.canOverride } : {}) } }, { status: 400 })
    }
  }

  // Validate dates when provided
  if (updates.startDate || updates.dueDate) {
    const res = validateDates(updates.startDate ?? existing.startDate, updates.dueDate ?? existing.dueDate, 'UTC')
    if (!res.ok) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: res.reason } }, { status: 400 })
    }
  }

  const updated = db.updateTask(params.taskId, updates)
  if (!updated) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: { projectId: string; taskId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const ok = db.deleteTask(params.taskId)
  if (!ok) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 })
  return NextResponse.json({ success: true })
}
