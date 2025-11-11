import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { outboxStore } from '@/server/chat/outbox'
import { OutboxEnqueueSchema, OutboxDequeueSchema } from '@/server/schemas'

export async function GET() {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })

  const items = outboxStore.getAll(userId)
  return NextResponse.json({ success: true, data: { items, count: items.length } })
}

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })

  const body = await req.json()
  const parsed = OutboxEnqueueSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid outbox item' } }, { status: 400 })

  const item = outboxStore.enqueue(userId, parsed.data)
  return NextResponse.json({ success: true, data: item })
}

export async function DELETE(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  if (body?.clear === true) {
    outboxStore.clear(userId)
    return NextResponse.json({ success: true })
  }

  const parsed = OutboxDequeueSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid payload' } }, { status: 400 })

  const ok = outboxStore.dequeue(userId, parsed.data.id)
  return NextResponse.json({ success: ok })
}
