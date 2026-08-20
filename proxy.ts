import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Fold www onto the apex before anything else. Vercel serves both, and only
  // the blog routes emit a canonical tag, so without this the static pages
  // exist at two addresses as far as a crawler is concerned. 308 rather than
  // 302 so the method is preserved and the move is cached as permanent.
  const host = request.headers.get('host') ?? ''
  if (host.startsWith('www.')) {
    const apex = request.nextUrl.clone()
    apex.host = host.slice(4)
    apex.protocol = 'https'
    apex.port = ''
    return NextResponse.redirect(apex, 308)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    // Everything except static assets and images, which never carry a session.
    '/((?!_next/static|_next/image|favicon.svg|images|feed.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
