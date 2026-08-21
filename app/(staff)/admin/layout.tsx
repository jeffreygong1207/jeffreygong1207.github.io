import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StaffSidebar from '@/components/admin/StaffSidebar'

export const metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The proxy already gated this path. Repeating the check here means a matcher
  // change or a direct render cannot quietly expose the workspace.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/admin')

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect('/')

  return (
    // Deliberately outside the public shell: no site nav, no centred column.
    // The staff area should not read as another page of the portfolio.
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebar email={user.email ?? ''} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">{children}</div>
      </main>
    </div>
  )
}
