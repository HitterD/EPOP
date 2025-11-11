import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// In-memory store for demo; replace with persistent store in production
declare global {
  // eslint-disable-next-line no-var
  var __pushSubs: Map<string, any> | undefined
}

export async function POST(request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const body = await request.json().catch(() => ({} as any))
  const subscription = body?.subscription ?? body
  if (!subscription)
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'subscription is required' } }, { status: 400 })

  const store = (globalThis as any).__pushSubs || new Map<string, any>()
  store.set(userId, subscription)
  ;(globalThis as any).__pushSubs = store

  return NextResponse.json({ success: true })
}
