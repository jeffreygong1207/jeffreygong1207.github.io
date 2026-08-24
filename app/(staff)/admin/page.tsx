import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Arrow from '@/components/staff/Arrow'
import { PLATE, PLATE_CARD, PLATE_ROW } from '@/components/admin/plate'
import { SHELVES, TOTAL_VOLUMES } from '@/lib/coursework'
import { EXPERIENCE_ROLES } from '@/lib/experience'
import { PROJECTS } from '@/lib/projects'
import { AUTHOR_TZ } from '@/app/(staff)/admin/posts/page'
import type { Post, PostStatus } from '@/lib/types'

type Row = Pick<
  Post,
  'id' | 'title' | 'subtitle' | 'slug' | 'status' | 'published_at' | 'updated_at' | 'reading_minutes' | 'tags'
>

// 1.3: a drop shadow is invisible on #233226, so an object on the dark ground
// gets an inset hairline instead. Written as Tailwind utilities rather than the
// unlayered `.salon-plate` class or an inline style, because both of those beat
// a `hover:` variant on the same element and these plates need a hover state.
//
// Two channels on hover, not one: `bg-salon-raised` alone measures ~1.5:1
// against the plate, which is a nudge, not a state change. The hairline goes
// from 0.14 to 0.30 alpha at the same time, so the edge of the object brightens
// as well as its face.

const DISPLAY = { fontFamily: 'var(--salon-font-display)' }
const MONO = { fontFamily: 'var(--salon-font-mono)' }

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

export default async function Cabinet() {
  // One query, one round trip. Every number on this page is computed in JS over
  // the same result set the drafts come out of.
  const supabase = await createClient()
  // Captured, not discarded: `?? []` alone renders a failed query as an empty
  // cabinet, and every count on this page would read a confident zero.
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, subtitle, slug, status, published_at, updated_at, reading_minutes, tags')
    .order('updated_at', { ascending: false })

  const all = (data ?? []) as Row[]
  const counts: Record<PostStatus, number> = {
    published: all.filter((p) => p.status === 'published').length,
    draft: all.filter((p) => p.status === 'draft').length,
    unlisted: all.filter((p) => p.status === 'unlisted').length,
  }
  // Every draft, not "the draft". How many there are today is data, not a rule.
  const drafts = all.filter((p) => p.status === 'draft')

  // Navigation copy names what is counted and nothing else. It must survive a
  // redesign of the surface it points at, so no sleeves, crates or slates here:
  // rename the drawing and these lines still read true.
  const sections: { href: string; name: string; note: string }[] = [
    {
      href: '/admin/posts',
      name: 'Posts',
      note: `${counts.published} published · ${plural(counts.draft, 'draft')} · ${counts.unlisted} unlisted`,
    },
    { href: '/admin/media', name: 'Media', note: 'Uploads, covers and stills' },
    // Coursework / Projects / Experience are static arrays, not Postgres, but
    // they are no longer trapped inside their own surfaces: each one now exports
    // its data from lib/, so these figures are derived rather than transcribed.
    // They agree with the spec's inventory (2.2 = 39 volumes on 4 shelves,
    // 2.3 = 11 projects, 2.4 = 6 roles) because the data says so, not because
    // this file repeats it — adding a course cannot leave this line stale.
    {
      href: '/admin/coursework',
      name: 'Coursework',
      note: `${TOTAL_VOLUMES} volumes across ${SHELVES.length} shelves`,
    },
    { href: '/admin/projects', name: 'Projects', note: plural(PROJECTS.length, 'project') },
    {
      href: '/admin/experience',
      name: 'Experience',
      note: plural(EXPERIENCE_ROLES.length, 'role'),
    },
  ]

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="salon-h1">The Cabinet</h1>
          {/* `salon-label` rather than a hand-rolled near-miss of it: this was
              11px at 0.2em where the token is 10px at 0.13em, which made the
              same line read differently on each of five surfaces. */}
          <p className="salon-label mt-4">{plural(all.length, 'post')}</p>
        </div>
      </header>

      <section className="mb-12">
        {/* Section labels are real content at 11px, so spec 3 requires 4.5:1.
            --salon-subtle is 3.43:1 on --salon-ground and fails; --salon-muted
            measures 5.25:1 there. Same call Crate.module.css and the slate ink
            scale already make. */}
        <h2
          className="mb-4 text-[11px] uppercase tracking-[0.24em] text-salon-muted"
          style={MONO}
        >
          Sections
        </h2>

        {/* 1.2: objects sit on a plate 1-4% off the page, not in a bordered
            card. No border, no radius, no drop shadow.

            One column at every width. Five cards in `sm:grid-cols-2` render
            2+2+1 and leave a card-sized hole at the bottom right of the first
            screen; a nav list of five reads down the page anyway. */}
        <ul className="grid gap-3">
          {sections.map((e, i) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className={`group flex h-full items-start gap-4 px-5 py-5 salon-focus ${PLATE_CARD}`}
              >
                {/* Not --salon-subtle. The card lifts to --salon-raised on
                    hover and focus-within, where #71857A measures 2.79:1 — and
                    it is only 4.35:1 on the plate at rest, under the 4.5:1 this
                    11px counts as. #9DAFA4 is 7.41:1 on the plate and 4.76:1 on
                    raised, clearing both states, and stays 2.06:1 off
                    --salon-ink so the ordinal is still plainly the quieter of
                    the two. Same value Catalogue.module.css settled on for the
                    same reason. */}
                <span
                  aria-hidden="true"
                  className="pt-0.5 text-[11px] tabular-nums text-[#9DAFA4]"
                  style={MONO}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className="block text-[15px] uppercase tracking-[0.16em] text-salon-ink"
                    style={DISPLAY}
                  >
                    {e.name}
                  </span>
                  <span className="mt-2 block text-[13px] leading-snug text-salon-muted">
                    {e.note}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="pt-0.5 text-salon-accent opacity-0 transition-opacity duration-[240ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2
          className="mb-4 text-[11px] uppercase tracking-[0.24em] text-salon-muted"
          style={MONO}
        >
          On the desk
        </h2>

        {drafts.length === 0 ? (
          <p className={`px-5 py-8 text-sm text-salon-muted ${PLATE}`}>
            {error ? (
              'Could not reach the cabinet. Nothing here is a real count.'
            ) : (
              <>
                Nothing in progress.{' '}
                <Link
                  href="/admin/posts"
                  className="salon-focus text-salon-accent underline underline-offset-4"
                >
                  Start one
                </Link>
                .
              </>
            )}
          </p>
        ) : (
          <ul className={PLATE}>
            {drafts.map((post, i) => (
              <li key={post.id} className={i > 0 ? 'border-t border-salon-line' : ''}>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className={`salon-focus flex items-baseline gap-4 px-5 py-4 ${PLATE_ROW}`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] text-salon-ink">{post.title}</span>
                    {post.subtitle && (
                      <span className="mt-1 block truncate text-[13px] text-salon-muted">
                        {post.subtitle}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-salon-muted" style={MONO}>
                    {post.reading_minutes} min ·{' '}
                    {/* AUTHOR_TZ, not the runtime's zone. Vercel renders in UTC,
                        so an unzoned format here and the zoned one on
                        /admin/posts disagree about the date for seven hours a
                        day — the same post, two dates, on two pages. */}
                    {new Date(post.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      timeZone: AUTHOR_TZ,
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
