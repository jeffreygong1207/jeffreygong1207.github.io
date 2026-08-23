'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// The doorway between the public site and the staff side.
//
// Deliberately resolved on the client. Reading the session in app/(site)/layout.tsx
// would opt every public page out of static prerendering just to decide one link,
// which is a bad trade for a portfolio that is otherwise 20 static pages.
//
// This is an affordance, not a gate: `getSession()` reads the cookie without
// validating it, so a stale cookie can render "Admin". That is harmless — the
// real checks are proxy.ts, the admin layout, and the RLS policies, and anyone
// who is not on the allowlist simply gets bounced back out.
export default function SessionLink() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let alive = true

    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSignedIn(Boolean(data.session))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) setSignedIn(Boolean(session))
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Hold the slot until the answer is known, so the nav does not jump.
  if (signedIn === null) {
    return <span aria-hidden="true" className="inline-block h-[34px] w-[92px] shrink-0" />
  }

  return signedIn ? (
    <Link
      href="/admin"
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-blue-600"
    >
      Admin
      <span aria-hidden="true">&rarr;</span>
    </Link>
  ) : (
    <Link
      href="/login?next=%2Fadmin"
      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-blue-600"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
        <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.14 6.16-4.14Z" />
      </svg>
      Sign in
    </Link>
  )
}
