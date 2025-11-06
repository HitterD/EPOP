import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Prototype: accept and store nothing, just return success
export async function POST(request: NextRequest) {
  const accessToken = cookies().get('accessToken')?.value
  if (!accessToken)
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )

  // In a real impl, parse subscription and store in DB for the user
  // const body = await request.json()

  return NextResponse.json({ success: true })
}
