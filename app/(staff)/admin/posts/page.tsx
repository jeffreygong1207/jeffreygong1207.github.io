import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createPost } from '@/lib/actions'
import type { Post, PostStatus } from '@/lib/types'

type Row = Pick<
  Post,
  'id' | 'title' | 'subtitle' | 'slug' | 'status' | 'published_at' | 'updated_at' | 'reading_minutes' | 'tags'
>

const FILTERS: { key: string; label: string; status?: PostStatus }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published', status: 'published' },
  { key: 'draft', label: 'Drafts', status: 'draft' },
  { key: 'unlisted', label: 'Unlisted', status: 'unlisted' },
]

// Status carries a text label everywhere it appears, so the colour is a second
// channel rather than the only one. Salon values: foil for what is out in the
// room, the quiet tertiary for what is not, warm accent for what is set aside.
const STATUS_DOT: Record<PostStatus, string> = {
  published: 'bg-salon-gilt',
  draft: 'bg-salon-subtle',
  unlisted: 'bg-salon-accent',
}

// 1.3: inset hairline, not a drop shadow — a drop shadow is invisible on
// #233226. Tailwind utilities rather than the unlayered `.salon-plate` class or
// an inline style, because both of those beat a `hover:` variant on the same
// element.
const PLATE = 'bg-salon-plate shadow-[inset_0_0_0_1px_rgba(221,238,255,0.14)]'

// Two channels on a row, not one. `bg-salon-raised` alone is a small luminance
// step against the plate; the inset left hairline gives the row a lit edge at
// the same time. `focus-within` because the hover state lives on the <li> while
// the thing that takes focus is the title link inside it — without this, a
// keyboard user lands on a row that lights nothing.
const ROW_STATE =
  'transition-[background-color,box-shadow] duration-[240ms] ease-[cubic-bezier(0.25,1,0.5,1)] hover:bg-salon-raised hover:shadow-[inset_2px_0_0_0_rgba(221,238,255,0.30)] focus-within:bg-salon-raised focus-within:shadow-[inset_2px_0_0_0_rgba(221,238,255,0.30)]'

// This page is a server component, so the date is formatted once on the server —
// where the zone is UTC on Vercel, not the author's. Without an explicit zone,
// anything saved after 5pm local renders a day ahead of the author's own clock.
// Exported because app/(staff)/admin/page.tsx dates the same rows: two formats
// with two zones showed one post on two dates for seven hours a day.
export const AUTHOR_TZ = 'America/Los_Angeles'

const MONO = { fontFamily: 'var(--salon-font-mono)' }

export default async function PostsIndex({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const active = FILTERS.find((f) => f.key === status) ?? FILTERS[0]

  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('id, title, subtitle, slug, status, published_at, updated_at, reading_minutes, tags')
    .order('updated_at', { ascending: false })

  const all = (data ?? []) as Row[]
  const counts = {
    published: all.filter((p) => p.status === 'published').length,
    draft: all.filter((p) => p.status === 'draft').length,
    unlisted: all.filter((p) => p.status === 'unlisted').length,
  }
  // Filtered in JS, not with a DB `.eq()`: the tab strip needs every count on
  // every view, so a second query per tab would buy nothing.
  const rows = active.status ? all.filter((p) => p.status === active.status) : all

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="salon-h1">Posts</h1>
        <form action={createPost}>
          <button className="bg-salon-accent px-4 py-2 text-[13px] font-medium tracking-wide text-salon-sunken transition-colors hover:bg-salon-gilt salon-focus">
            New post
          </button>
        </form>
      </div>

      {/* Three counts and no plot: a stat tile is the right form here, not a chart. */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        <Stat label="Published" value={counts.published} />
        <Stat label="Drafts" value={counts.draft} />
        <Stat label="Unlisted" value={counts.unlisted} />
      </div>

      <div className="mb-4 flex gap-1 border-b border-salon-line">
        {FILTERS.map((f) => {
          const isActive = f.key === active.key
          return (
            <Link
              key={f.key}
              href={f.key === 'all' ? '/admin/posts' : `/admin/posts?status=${f.key}`}
              aria-current={isActive ? 'page' : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-[13px] transition-colors salon-focus ${
                isActive
                  ? 'border-salon-accent font-medium text-salon-ink'
                  : 'border-transparent text-salon-muted hover:text-salon-ink'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <p className={`px-6 py-16 text-center text-sm text-salon-muted ${PLATE}`}>
          {active.key === 'all' ? 'Nothing written yet.' : `No ${active.label.toLowerCase()}.`}
        </p>
      ) : (
        <ul className={PLATE}>
          {rows.map((post, i) => (
            <li
              key={post.id}
              className={`flex items-center gap-4 px-4 py-4 ${ROW_STATE} ${
                i > 0 ? 'border-t border-salon-line' : ''
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[post.status]}`}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="block truncate text-[15px] text-salon-ink salon-focus"
                >
                  {post.title}
                </Link>
                <p className="mt-1 truncate text-[11px] text-salon-muted" style={MONO}>
                  <span className="capitalize">{post.status}</span>
                  {' · '}
                  {post.reading_minutes} min
                  {post.tags.length > 0 && ` · ${post.tags.join(', ')}`}
                  {' · edited '}
                  {new Date(post.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    timeZone: AUTHOR_TZ,
                  })}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-[13px]">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="text-salon-muted transition-colors hover:text-salon-ink salon-focus"
                >
                  Edit<span className="sr-only"> {post.title}</span>
                </Link>
                {post.status !== 'draft' && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-salon-muted transition-colors hover:text-salon-ink salon-focus"
                  >
                    View<span className="sr-only"> {post.title}</span>
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={`px-4 py-4 ${PLATE}`}>
      <p className="text-[19px] tabular-nums text-salon-ink" style={MONO}>
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.13em] text-salon-muted" style={MONO}>
        {label}
      </p>
    </div>
  )
}
