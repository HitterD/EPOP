import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const refreshToken = cookies().get('refreshToken')?.value
  if (!refreshToken) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } }, { status: 401 })
  const userId = refreshToken.split('_')[1]
  const accessToken = `access_${userId}_${Date.now()}`
  cookies().set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })
  return NextResponse.json({ success: true, data: { accessToken, expiresAt: Date.now() + 15 * 60 * 1000 } })
}
