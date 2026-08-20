import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Everything except static assets and images, which never carry a session.
    '/((?!_next/static|_next/image|favicon.svg|images|feed.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
