import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').toLowerCase()
  if (!q) return NextResponse.json({ success: true, data: { messages: [], projects: [], users: [], files: [] } })

  // Very simple matching over in-memory data
  const users = db.getAllUsers().filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  const projects = (db as any).projects ? Array.from((db as any).projects.values()).filter((p: any) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)) : []
  const files = db.getAllFiles().filter((f) => f.name.toLowerCase().includes(q))
  const chats = (db as any).chats ? Array.from((db as any).chats.values()) : []
  const messages = chats.flatMap((c: any) => (db as any).messages.get(c.id) || []).filter((m: any) => (m.content || '').toLowerCase().includes(q))

  return NextResponse.json({ success: true, data: { messages, projects, users, files } })
}
