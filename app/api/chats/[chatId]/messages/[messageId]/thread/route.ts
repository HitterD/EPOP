import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'
import { CursorQuerySchema } from '@/lib/chat/schemas'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string; messageId: string } }
) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })

  const url = new URL(request.url)
  const parsed = CursorQuerySchema.safeParse({
    cursor: url.searchParams.get('cursor') || undefined,
    limit: url.searchParams.get('limit') || undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid pagination params' } },
      { status: 400 }
    )
  }
  const { cursor, limit = 50 } = parsed.data

  const all = db
    .getThread(params.messageId)
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const startIndex = cursor ? all.findIndex((m) => m.createdAt === cursor) + 1 : 0
  const items = all.slice(startIndex, startIndex + limit)
  const nextCursor = items.length === limit ? items[items.length - 1]?.createdAt : undefined

  return NextResponse.json({ success: true, data: { items, nextCursor, hasMore: Boolean(nextCursor) } })
}
