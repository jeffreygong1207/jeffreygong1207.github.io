'use client'

import Link from 'next/link'
import Arrow from '@/components/staff/Arrow'
import { usePathname } from 'next/navigation'

// The URL contract for the staff area. Every feature builds against these
// exact hrefs. `/admin/posts` is created by the posts feature; a 404 there
// during the concurrent phase is expected, not a bug in this file.
const NAV = [
  { href: '/admin', label: 'Cabinet', exact: true },
  { href: '/admin/posts', label: 'Posts', exact: false },
  { href: '/admin/media', label: 'Media', exact: false },
  { href: '/admin/coursework', label: 'Coursework', exact: false },
  { href: '/admin/projects', label: 'Projects', exact: false },
  { href: '/admin/experience', label: 'Experience', exact: false },
]

// One ring: 2px solid --salon-accent, offset 2px. Nothing here declares its
// own — this column had no focus style at all, which on a dark plate meant the
// UA default and effectively no visible focus for eight controls.
//
// On the editor page the shell goes light around this column while the column
// keeps its plate. globals.css resolves that by ground rather than by page:
// `.salon-plate` inside a light shell keeps the dark-ground ring (7.78:1 on
// #141E17), so the `salon-plate` class on the <aside> below is load bearing
// for focus, not only for the background.
const FOCUS = 'salon-focus'

// One gutter for the whole column. The container inset plus the control's own
// padding has to add up to the 20px the wordmark sits at, or the panel reads
// as two left edges in 224px.
const ROW = 'px-3'
const GUTTER = 'px-2'

// W3 owns the curve and the duration; nothing here writes its own.
const EASE = 'duration-[var(--salon-dur-ui)] ease-[var(--salon-ease)]'

export default function StaffSidebar({ email }: { email: string }) {
  const pathname = usePathname()

  return (
    // Below md this is a top bar, not a column: the old fixed w-56 ate 224px of
    // a 375px viewport with no way to collapse it. The nav wraps rather than
    // scrolling — `overflow` anywhere near the shell would flatten preserve-3d.
    <aside
      aria-label="Staff navigation"
      className="salon-plate relative w-full shrink-0 md:sticky md:top-0 md:flex md:h-screen md:w-56 md:flex-col"
    >
      <div className="px-5 pb-3 pt-5 md:pb-4 md:pt-6">
        <p
          className="text-[13px] font-semibold uppercase tracking-[0.22em] text-salon-ink"
          style={{ fontFamily: 'var(--salon-font-display)' }}
        >
          The Cabinet
        </p>
        <p
          className="mt-1 text-[10px] uppercase tracking-[0.18em] text-salon-muted"
          style={{ fontFamily: 'var(--salon-font-mono)' }}
        >
          jeffreygong.dev
        </p>
      </div>

      <nav
        className={`flex flex-wrap gap-1 ${GUTTER} pb-3 md:flex-1 md:flex-nowrap md:flex-col md:pb-0`}
      >
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`block ${ROW} py-2 text-sm transition-colors ${EASE} ${FOCUS} ${
                active
                  ? 'font-medium text-salon-accent'
                  : 'text-salon-muted hover:text-salon-ink'
              }`}
              style={
                active
                  ? { boxShadow: 'inset 2px 0 0 0 var(--salon-accent)' }
                  : undefined
              }
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${GUTTER} pb-4 pt-3 md:block md:pb-5`}
      >
        <hr className="salon-hairline mb-3 hidden w-full md:block" />
        <Link
          href="/blog"
          className={`block ${ROW} py-2 text-sm text-salon-muted transition-colors ${EASE} hover:text-salon-ink ${FOCUS}`}
        >
          View site <Arrow />
        </Link>
        {/* --salon-muted, not --salon-subtle: #71857A on the plate is under the
            4.5:1 floor, and neither the signed-in account nor the only
            sign-out control in the product is incidental text. */}
        <p
          className={`max-w-full truncate ${ROW} pt-1 text-[11px] text-salon-muted md:pt-4`}
          title={email}
          style={{ fontFamily: 'var(--salon-font-mono)' }}
        >
          {email}
        </p>
        {/* POST only, deliberately: a GET sign-out is CSRF-able by any <img>. */}
        <form action="/auth/signout" method="post" className="md:mt-1">
          <button
            /* 13px, not 11px. The comment above argues this is not incidental
               text and then fixes only its colour; 11px is fine-print size for
               the only sign-out control in the product. ROW is padding alone,
               so nothing here is width-constrained. */
            className={`${ROW} py-2 text-[13px] text-salon-muted transition-colors ${EASE} hover:text-salon-ink ${FOCUS}`}
          >
            Sign out
          </button>
        </form>
      </div>

      {/* 1.3: on a dark ground an object gets an inset hairline, not a drop
          shadow. The plate carries a full inset ring; the column's right edge
          reads as the room's line, so it is drawn separately at md and up. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-px md:block"
        style={{ background: 'var(--salon-line)' }}
      />
    </aside>
  )
}
