import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // For demo purposes, we'll handle auth client-side
  // In production, you'd check auth tokens here
  
  // Allow all requests to pass through
  // The ProtectedRoute component will handle client-side auth checks
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/polls/create/:path*']
}



