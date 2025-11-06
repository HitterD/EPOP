import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/mock-data'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Mock authentication - in production, verify password hash
    const user = db.getUserByEmail(email)
    
    if (!user || password !== 'password123') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      )
    }

    // Create mock tokens
    const accessToken = `access_${user.id}_${Date.now()}`
    const refreshToken = `refresh_${user.id}_${Date.now()}`
    const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes

    // Set httpOnly cookies
    cookies().set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })

    cookies().set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
        expiresAt,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
