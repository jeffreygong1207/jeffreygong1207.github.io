'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Posts', exact: true },
  { href: '/admin/media', label: 'Media', exact: false },
]

export default function StaffSidebar({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="px-5 py-6">
        <p className="text-sm font-bold tracking-tight text-gray-900">Staff</p>
        <p className="mt-0.5 text-xs text-gray-400">jeffreygong.dev</p>
      </div>

      <nav className="flex-1 px-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-0.5 block rounded-md px-3 py-2 text-sm transition ${
                active
                  ? 'bg-gray-900 font-medium text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 px-3 py-4">
        <Link
          href="/blog"
          className="mb-0.5 block rounded-md px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
        >
          View site &rarr;
        </Link>
        <p className="truncate px-3 pt-2 text-xs text-gray-400" title={email}>
          {email}
        </p>
        <form action="/auth/signout" method="post">
          <button className="mt-1 px-3 text-xs text-gray-500 transition hover:text-gray-900">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
