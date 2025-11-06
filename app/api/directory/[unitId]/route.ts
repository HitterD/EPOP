import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/mock-data'

export async function PATCH(request: NextRequest, { params }: { params: { unitId: string } }) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 })
  const updates = await request.json()
  const updated = db.updateOrgUnit(params.unitId, updates)
  if (!updated) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Unit not found' } }, { status: 404 })
  return NextResponse.json({ success: true, data: updated })
}
