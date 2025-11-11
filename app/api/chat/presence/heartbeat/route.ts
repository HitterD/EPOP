import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { presenceManager } from '@/server/chat/presence'
import { chatEvents } from '@/server/chat/events'

const BodySchema = z.object({
  status: z.enum(['online', 'away', 'offline']).default('online'),
})

export async function POST(req: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  if (!userId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 })

  let status: 'online' | 'away' | 'offline' = 'online'
  try {
    const body = await req.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) throw new Error('Invalid body')
    status = parsed.data.status
  } catch {}

  presenceManager.heartbeat(userId, status)
  chatEvents.append('presence:update', { userId, status })

  return NextResponse.json({ success: true, data: { userId, status, serverTimestamp: Date.now() } })
}
