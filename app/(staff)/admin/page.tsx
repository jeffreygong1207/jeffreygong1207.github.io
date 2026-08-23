import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SHELVES, TOTAL_VOLUMES } from '@/lib/coursework'
import { EXPERIENCE_ROLES } from '@/lib/experience'
import { PROJECTS } from '@/lib/projects'
import type { Post, PostStatus } from '@/lib/types'

type Row = Pick<
  Post,
  'id' | 'title' | 'subtitle' | 'slug' | 'status' | 'published_at' | 'updated_at' | 'reading_minutes' | 'tags'
>

// 1.3: a drop shadow is invisible on #233226, so an object on the dark ground
// gets an inset hairline instead. Written inline rather than through the
// `.salon-plate` class because that rule is unlayered and would beat a Tailwind
// `hover:bg-*` on the same element — the entrances need a hover state.
const PLATE_RING = { boxShadow: 'inset 0 0 0 1px rgba(221, 238, 255, 0.14)' }

const DISPLAY = { fontFamily: 'var(--salon-font-display)' }
const MONO = { fontFamily: 'var(--salon-font-mono)' }

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

export default async function Cabinet() {
  // One query, one round trip. Every number on this page is computed in JS over
  // the same result set the drafts come out of.
  const supabase = await createClient()
  const { data } = await supabase
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

  const entrances: { href: string; name: string; note: string }[] = [
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
    { href: '/admin/projects', name: 'Projects', note: `${PROJECTS.length} sleeves in the crate` },
    {
      href: '/admin/experience',
      name: 'Experience',
      note: `${plural(EXPERIENCE_ROLES.length, 'role')} on the slate`,
    },
  ]

  return (
    <>
      <header className="mb-10">
        <h1
          className="text-[26px] uppercase leading-none tracking-[0.2em] text-salon-ink md:text-[30px]"
          style={DISPLAY}
        >
          The Cabinet
        </h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-salon-muted" style={MONO}>
          {plural(all.length, 'piece')} in the room
        </p>
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
          Entrances
        </h2>

        {/* 1.2: objects sit on a plate 1-4% off the page, not in a bordered
            card. No border, no radius, no drop shadow. */}
        <ul className="grid gap-3 sm:grid-cols-2">
          {entrances.map((e, i) => (
            <li key={e.href}>
              <Link
                href={e.href}
                style={PLATE_RING}
                className="group flex h-full items-start gap-4 bg-salon-plate px-5 py-5 transition-colors hover:bg-salon-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salon-accent"
              >
                <span
                  aria-hidden="true"
                  className="pt-0.5 text-[11px] tabular-nums text-salon-subtle"
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
                  className="pt-0.5 text-salon-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  &rarr;
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
          <p style={PLATE_RING} className="bg-salon-plate px-5 py-8 text-sm text-salon-muted">
            Nothing in progress.{' '}
            <Link
              href="/admin/posts"
              className="text-salon-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salon-accent"
            >
              Start one
            </Link>
            .
          </p>
        ) : (
          <ul style={PLATE_RING} className="bg-salon-plate">
            {drafts.map((post, i) => (
              <li key={post.id} className={i > 0 ? 'border-t border-salon-line' : ''}>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="flex items-baseline gap-4 px-5 py-4 transition-colors hover:bg-salon-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-salon-accent"
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
                    {new Date(post.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
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
