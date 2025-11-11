import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

declare global {
  // eslint-disable-next-line no-var
  var __pushSubs: Map<string, any> | undefined
}

export async function POST(_request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const userId = accessToken.split('_')[1]
  const store = (globalThis as any).__pushSubs
  if (store && store.has(userId)) {
    store.delete(userId)
  }
  return NextResponse.json({ success: true })
}
