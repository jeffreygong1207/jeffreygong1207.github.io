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
// channel rather than the only one.
const STATUS_DOT: Record<PostStatus, string> = {
  published: 'bg-green-600',
  draft: 'bg-gray-400',
  unlisted: 'bg-amber-500',
}

export default async function AdminDashboard({
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
  const rows = active.status ? all.filter((p) => p.status === active.status) : all

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Posts</h1>
        <form action={createPost}>
          <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700">
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

      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {FILTERS.map((f) => {
          const isActive = f.key === active.key
          return (
            <Link
              key={f.key}
              href={f.key === 'all' ? '/admin' : `/admin?status=${f.key}`}
              className={`-mb-px border-b-2 px-3 py-2 text-sm transition ${
                isActive
                  ? 'border-gray-900 font-medium text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-sm text-gray-500">
          {active.key === 'all' ? 'Nothing written yet.' : `No ${active.label.toLowerCase()}.`}
        </p>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {rows.map((post, i) => (
            <li
              key={post.id}
              className={`group flex items-center gap-4 px-4 py-3.5 transition hover:bg-gray-50 ${
                i > 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[post.status]}`}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="block truncate font-medium text-gray-900"
                >
                  {post.title}
                </Link>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  <span className="capitalize">{post.status}</span>
                  {' · '}
                  {post.reading_minutes} min
                  {post.tags.length > 0 && ` · ${post.tags.join(', ')}`}
                  {' · edited '}
                  {new Date(post.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 text-xs">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="text-gray-500 transition hover:text-gray-900"
                >
                  Edit
                </Link>
                {post.status !== 'draft' && (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-gray-500 transition hover:text-gray-900"
                  >
                    View
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
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <p className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  )
}
