import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db/mock-data'

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!accessToken && !isPublicRoute && pathname !== '/') {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // RBAC: admin guard for /admin routes
  if (accessToken && pathname.startsWith('/admin')) {
    const userId = accessToken.split('_')[1]
    const me = userId ? db.getUser(userId) : undefined
    if (!me || me.role !== 'admin') {
      const dash = new URL('/dashboard', request.url)
      dash.searchParams.set('forbidden', '1')
      return NextResponse.redirect(dash)
    }
  }

  // Redirect root to dashboard if authenticated, otherwise to login
  if (pathname === '/') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|service-worker.js).*)'],
}
