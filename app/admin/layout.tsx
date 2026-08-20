import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already gated this path. Repeating the check here means a
  // matcher change or a direct render cannot quietly expose the dashboard.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect('/')

  return (
    <div className="px-6 md:px-8">
      <header className="mb-10 flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-baseline gap-4">
          <Link href="/admin" className="text-lg font-bold text-gray-900">
            Staff
          </Link>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
            View blog
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-500 sm:inline">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="text-sm text-gray-500 hover:text-gray-900">Sign out</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  )
}
