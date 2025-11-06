import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/mock-data'
import { generateId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Check if registration is enabled
    if (process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'false') {
      return NextResponse.json(
        { success: false, error: { code: 'REGISTRATION_DISABLED', message: 'Registration is disabled' } },
        { status: 403 }
      )
    }

    // Check if user already exists
    const existingUser = db.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_EXISTS', message: 'User already exists' } },
        { status: 400 }
      )
    }

    // Create new user
    const newUser = db.createUser({
      id: generateId(),
      email,
      name,
      role: 'member',
      permissions: [],
      presence: 'offline',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: { message: 'User created successfully' },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
