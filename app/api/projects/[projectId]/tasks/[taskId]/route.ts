import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

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
  const updates = await request.json()
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
