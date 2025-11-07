import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { DashboardSummary, AgendaItem, StorageUsage } from '@/types'

export async function GET(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const userId = accessToken.split('_')[1]
  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } },
      { status: 401 }
    )
  }
  const projects = db.getUserProjects(userId)
  const chats = db.getUserChats(userId)
  const files = db.getAllFiles()

  const tasks = projects
    .flatMap((p) => db.getProjectTasks(p.id))
    .filter((t) => t.assigneeIds.includes(userId))

  const upcoming: AgendaItem[] = tasks
    .filter((t) => t.dueDate)
    .map((t) => ({
      id: t.id,
      title: t.title,
      type: 'task' as const,
      startDate: t.startDate || t.dueDate!,
      ...(t.dueDate ? { endDate: t.dueDate } : {}),
      projectId: t.projectId,
    }))
    .slice(0, 5)

  const total = 10 * 1024 * 1024 * 1024
  const used = files.reduce((sum, f) => sum + f.size, 0)
  const storage: StorageUsage = {
    used,
    total,
    percentage: Math.min(100, Math.round((used / total) * 100)),
  }

  const summary: DashboardSummary = {
    currentProjects: projects.slice(0, 5),
    unreadMessages: chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    myTasks: tasks.slice(0, 5),
    upcomingAgenda: upcoming,
    storageUsage: storage,
  }

  return NextResponse.json({ success: true, data: summary })
}
