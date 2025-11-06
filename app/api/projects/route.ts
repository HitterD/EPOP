import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { Project } from '@/types'

export async function GET() {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const projects = db.getUserProjects(userId)
  return NextResponse.json({ success: true, data: projects })
}

export async function POST(request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const body = await request.json()
  const now = new Date().toISOString()
  const project: Project = {
    id: `proj-${Date.now()}`,
    name: body.name,
    description: body.description || '',
    color: body.color || '#3B82F6',
    ownerId: userId,
    memberIds: [userId],
    buckets: [],
    createdAt: now,
    updatedAt: now,
  }
  const created = db.createProject(project)
  return NextResponse.json({ success: true, data: created })
}
