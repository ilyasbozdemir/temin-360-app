import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase()
  const response = NextResponse.next()

  // Sadece demo domaini (temin360app.demo.ilyasbozdemir.dev) veya NO_INDEX=true ortamlarında arama motorlarını engelle
  const isDemoDomain =
    host.includes('temin360app.demo.ilyasbozdemir.dev') ||
    host.includes('demo.ilyasbozdemir.dev') ||
    process.env.NO_INDEX === 'true' ||
    process.env.NEXT_PUBLIC_NO_INDEX === 'true' ||
    process.env.ENVIRONMENT === 'demo'

  if (isDemoDomain) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  }

  return response
}

export const config = {
  matcher: '/:path*',
}
