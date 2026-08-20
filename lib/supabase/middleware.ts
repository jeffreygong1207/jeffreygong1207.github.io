import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Refreshes the auth cookie on every request and gates /admin. Returning the
// same response object the Supabase client wrote cookies into is load-bearing:
// build a fresh NextResponse here and the refreshed session is dropped.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser, not getSession: this revalidates the JWT against Supabase rather
  // than trusting a cookie the browser could have forged.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const login = request.nextUrl.clone()
      login.pathname = '/login'
      login.searchParams.set('next', request.nextUrl.pathname)
      return NextResponse.redirect(login)
    }

    // Signed in is not the same as allowed. The allowlist is the real gate and
    // RLS enforces it again at the table; this check only spares the dashboard
    // from rendering for someone who would see nothing anyway.
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) {
      const home = request.nextUrl.clone()
      home.pathname = '/'
      home.search = ''
      return NextResponse.redirect(home)
    }
  }

  return response
}
