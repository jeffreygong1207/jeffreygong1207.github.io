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
// #233226. Inline because `.salon-plate` is unlayered and would beat a Tailwind
// hover background on the same element.
const PLATE_RING = { boxShadow: 'inset 0 0 0 1px rgba(221, 238, 255, 0.14)' }

// This page is a server component, so the date is formatted once on the server —
// where the zone is UTC on Vercel, not the author's. Without an explicit zone,
// anything saved after 5pm local renders a day ahead of the author's own clock.
const AUTHOR_TZ = 'America/Los_Angeles'

const DISPLAY = { fontFamily: 'var(--salon-font-display)' }
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
        <h1
          className="text-[26px] uppercase leading-none tracking-[0.2em] text-salon-ink"
          style={DISPLAY}
        >
          Posts
        </h1>
        <form action={createPost}>
          <button className="bg-salon-accent px-4 py-2 text-[13px] font-medium tracking-wide text-salon-sunken transition-colors hover:bg-salon-gilt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salon-ink">
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
              className={`-mb-px border-b-2 px-3 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salon-accent ${
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
        <p style={PLATE_RING} className="bg-salon-plate px-6 py-16 text-center text-sm text-salon-muted">
          {active.key === 'all' ? 'Nothing written yet.' : `No ${active.label.toLowerCase()}.`}
        </p>
      ) : (
        <ul style={PLATE_RING} className="bg-salon-plate">
          {rows.map((post, i) => (
            <li
              key={post.id}
              className={`flex items-center gap-4 px-4 py-4 transition-colors hover:bg-salon-raised ${
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
                  className="block truncate text-[15px] text-salon-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salon-accent"
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
                  className="text-salon-muted transition-colors hover:text-salon-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salon-accent"
                >
                  Edit<span className="sr-only"> {post.title}</span>
                </Link>
                {post.status !== 'draft' && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-salon-muted transition-colors hover:text-salon-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salon-accent"
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
    <div style={PLATE_RING} className="bg-salon-plate px-4 py-4">
      <p className="text-2xl tabular-nums text-salon-ink" style={{ fontFamily: 'var(--salon-font-mono)' }}>
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-salon-muted" style={MONO}>
        {label}
      </p>
    </div>
  )
}
