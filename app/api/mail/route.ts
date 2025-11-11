import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { CursorQuerySchema } from '@/lib/chat/schemas'
import { getIdempotent, setIdempotent } from '@/lib/server/idempotency'
import { MailCreateSchema } from '@/server/mail/schemas'

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
  const parsed = CursorQuerySchema.safeParse({
    cursor: searchParams.get('cursor') || undefined,
    limit: searchParams.get('limit') || undefined,
  })
  if (!parsed.success)
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid pagination params' } }, { status: 400 })
  const { cursor, limit = 50 } = parsed.data
  const all = db.listMailByFolder(folder)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const startIndex = cursor ? all.findIndex((m) => m.createdAt === cursor) + 1 : 0
  const items = all.slice(startIndex, startIndex + limit)
  const nextCursor = items.length === limit ? items[items.length - 1]?.createdAt : undefined
  return NextResponse.json({ success: true, data: { items, nextCursor, hasMore: Boolean(nextCursor) } })
}

export async function POST(request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const idempKey = headers().get('Idempotency-Key') || undefined
  if (idempKey) {
    const cached = getIdempotent(idempKey)
    if (cached) return NextResponse.json(cached.body as object, { status: cached.status })
  }
  const raw = await request.json()
  const parsed = MailCreateSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid mail payload' } }, { status: 400 })
  }
  const { to, cc, bcc, subject, body, attachments, priority } = parsed.data
  const now = new Date().toISOString()
  const mail: MailMessage = {
    id: `mail-${Date.now()}`,
    from: `${userId}@epop.com`,
    to,
    cc,
    bcc,
    subject,
    body: typeof body === 'string' ? sanitizeHtml(body) : sanitizeHtml((body as any).html),
    attachments: (attachments || []).map((att: any, idx: number) => {
      const fid = att.id ?? `file-${Date.now()}-${idx}`
      return {
        id: `att-${Date.now()}-${idx}`,
        fileId: fid,
        name: att.name,
        size: att.size ?? 0,
        mimeType: att.mimeType ?? 'application/octet-stream',
        url: att.url ?? '',
      }
    }),
    folder: 'sent',
    date: now,
    isRead: true,
    isStarred: false,
    priority: priority || 'normal',
    createdAt: now,
    updatedAt: now,
  }
  const created = db.createMail(mail)
  const resBody = { success: true, data: created }
  if (idempKey) setIdempotent(idempKey, 200, resBody)
  return NextResponse.json(resBody)
}
