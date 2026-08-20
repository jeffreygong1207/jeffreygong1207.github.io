import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Publishable key only. A service-role client would bypass RLS across the
// whole project -- which on this project includes the quorum schema -- so the
// web app never holds one. Anything that genuinely needs to cross RLS runs in
// an Edge Function instead.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Middleware refreshes the session, so ignoring this is safe.
          }
        },
      },
    }
  )
}
