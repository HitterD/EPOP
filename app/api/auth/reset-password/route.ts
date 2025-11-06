import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Missing token or password' } },
        { status: 400 }
      )
    }
    // In prototype, accept any token
    return NextResponse.json({ success: true, data: { message: 'Password updated' } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
