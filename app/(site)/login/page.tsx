import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignInButton from '@/components/admin/SignInButton'

export const metadata = { title: 'Sign in — Jeffrey Gong', robots: { index: false } }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (isAdmin) redirect('/admin')
  }

  return (
    <section className="py-24">
      <div className="mx-auto max-w-sm px-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="mb-8 text-sm text-gray-500">
          Authoring is limited to the site allowlist.
        </p>

        {error && (
          <p className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            Sign-in failed. Try again.
          </p>
        )}

        {user && (
          <p className="mb-6 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Signed in as {user.email}, which is not on the allowlist.
          </p>
        )}

        <SignInButton next={next} />
      </div>
    </section>
  )
}
