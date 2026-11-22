import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'

import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Payload stores the admin language in this cookie. Without it, Payload would follow
// the browser language; the admin should start in German (docs/entscheidungen).
const ADMIN_LANGUAGE_COOKIE = 'payload-lng'

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.cookies.has(ADMIN_LANGUAGE_COOKIE)) return NextResponse.next()
    request.cookies.set(ADMIN_LANGUAGE_COOKIE, 'de')
    const response = NextResponse.next({ request: { headers: request.headers } })
    response.cookies.set(ADMIN_LANGUAGE_COOKIE, 'de', { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }
  return intlMiddleware(request)
}

export const config = {
  // Locale routing for everything except Payload's API, files, feeds for espritsg.ch,
  // legacy WordPress paths and static assets. /admin is matched only to set the
  // admin language. See docs/urls-und-weiterleitungen.md.
  matcher: [
    '/admin/:path*',
    '/((?!api|admin|files|wp-content|issues|category|next|_next|_vercel|feed|sitemap.xml|robots.txt|favicon.ico|.*\\..*).*)',
  ],
}
