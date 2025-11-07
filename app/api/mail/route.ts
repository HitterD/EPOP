import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

function sanitizeHtml(input?: string | null): string {
  if (!input) return ''
  let html = String(input)
  html = html.replace(/<\/(?:script|style|iframe|object|embed)>/gi, '')
  html = html.replace(/<(?:script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/(?:script|style|iframe|object|embed)>/gi, '')
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  html = html.replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'\"]*\2/gi, '$1="#"')
  html = html.replace(/(href|src)\s*=\s*javascript:[^\s>]+/gi, '$1="#"')
  return html
}
import { MailMessage } from '@/types'

export async function GET(request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const folder = (searchParams.get('folder') as 'received' | 'sent' | 'deleted') || 'received'
  const list = db.listMailByFolder(folder)
  return NextResponse.json({ success: true, data: list })
}

export async function POST(request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const { to, cc, bcc, subject, body, attachments, priority } = await request.json()
  const now = new Date().toISOString()
  const mail: MailMessage = {
    id: `mail-${Date.now()}`,
    from: `${userId}@epop.com`,
    to,
    cc,
    bcc,
    subject,
    body: typeof body === 'string' ? sanitizeHtml(body) : body,
    attachments,
    folder: 'sent',
    date: now,
    isRead: true,
    isStarred: false,
    priority: priority || 'normal',
    createdAt: now,
    updatedAt: now,
  }
  const created = db.createMail(mail)
  return NextResponse.json({ success: true, data: created })
}
