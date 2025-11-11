import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { updateDependencies } from '@/server/projects/deps'

export async function GET(_req: NextRequest, { params }: { params: { projectId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const tasks = db.getProjectTasks(params.projectId)
  const edges: Array<{ taskId: string; dependsOn: string[] }> = tasks.map((t) => ({ taskId: t.id, dependsOn: t.dependencies || [] }))
  return NextResponse.json({ success: true, data: { edges } })
}

export async function POST(req: NextRequest, { params }: { params: { projectId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const body = await req.json().catch(() => null)
  const updates: Array<{ taskId: string; dependsOn: string[] }> = Array.isArray(body?.updates) ? body.updates : []
  if (!updates.length) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'updates[] required' } }, { status: 400 })

  const tasks = db.getProjectTasks(params.projectId)
  const result = updateDependencies(tasks, updates)
  if (!result.ok) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: result.reason } }, { status: 400 })

  for (const u of updates) {
    const t = db.getTask(u.taskId)
    if (t) db.updateTask(t.id, { dependencies: [...new Set(u.dependsOn)] })
  }

  return NextResponse.json({ success: true })
}
