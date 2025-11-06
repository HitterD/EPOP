import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const { unitId } = await request.json()
  const ok = db.moveUserToUnit(params.userId, unitId)
  if (!ok) return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Move failed' } }, { status: 400 })
  return NextResponse.json({ success: true })
}
