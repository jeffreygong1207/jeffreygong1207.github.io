import { redirect } from 'next/navigation'
import {
  Archivo,
  Cinzel,
  EB_Garamond,
  IBM_Plex_Mono,
  Karla,
  Newsreader,
} from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import StaffSidebar from '@/components/admin/StaffSidebar'

export const metadata = { robots: { index: false, follow: false } }

// The six Salon families, loaded from exactly one place. next/font self-hosts
// them out of /_next/static/media, so this needs no CSP change and never
// touches a public file — app/layout.tsx is shared with the site and off-limits.
// Consume them through the `--salon-font-*` stacks in globals.css, which are
// resolved on the shell element where these variables are set.
const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
})

const karla = Karla({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-karla',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  // Optical size is a real axis on Newsreader; the reading sheet sets 18.5px
  // and spine captions run far smaller, so keep the whole 6..72 range.
  axes: ['opsz'],
  variable: '--font-newsreader',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  // Plex Mono ships static cuts only, so the weights are enumerated.
  weight: ['400', '500'],
  variable: '--font-plex-mono',
})

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  // MUST be the variable axis, not static cuts: cover archetype C sets
  // font-stretch 78% / 112% off the wdth axis and static Archivo cannot do it.
  axes: ['wdth'],
  variable: '--font-archivo',
})

const garamond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-garamond',
})

const FONT_VARS = [
  cinzel.variable,
  karla.variable,
  newsreader.variable,
  plexMono.variable,
  archivo.variable,
  garamond.variable,
].join(' ')

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
    //
    // Never put `overflow`, `filter`, `opacity < 1`, `clip-path` or `mask` on
    // this element or on <main>. Each of them silently forces
    // `transform-style: preserve-3d` back to `flat`, and that has already
    // rendered a whole shelf as a flat rectangle once in this project.
    <>
      <div
        className={`salon-shell flex min-h-screen flex-col md:flex-row ${FONT_VARS}`}
      >
        <StaffSidebar email={user.email ?? ''} />
        <main className="min-w-0 flex-1">
          <div className="salon-column">{children}</div>
        </main>
      </div>

      {/* The ONE screen-space grain for the whole staff area (2.2 rule 16).
          A sibling of the content, never a wrapper: wrapping a preserve-3d
          subtree in a blended/filtered element flattens it. Features must not
          add a second one — per-object grain rasterises at pre-transform size
          and blurs when the 3D transform scales it. */}
      <svg className="salon-grain" aria-hidden="true" focusable="false">
        <filter id="salon-grain" colorInterpolationFilters="sRGB">
          {/* sRGB is not optional (rule 17): the default linearRGB returns
              noise roughly 47% brighter than these values were tuned for. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.72"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#salon-grain)" />
      </svg>
    </>
  )
}
