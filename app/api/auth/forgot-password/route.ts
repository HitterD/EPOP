import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/mock-data'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    const user = db.getUserByEmail(email)
    
    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      data: { message: 'If the email exists, a reset link has been sent' },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
