import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createPost } from './actions'
import type { Post } from '@/lib/types'

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-50 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  unlisted: 'bg-amber-50 text-amber-700',
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, subtitle, slug, status, published_at, updated_at, reading_minutes, tags')
    .order('updated_at', { ascending: false })

  const rows = (posts ?? []) as Pick<
    Post,
    'id' | 'title' | 'subtitle' | 'slug' | 'status' | 'published_at' | 'updated_at' | 'reading_minutes' | 'tags'
  >[]

  return (
    <section className="pb-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <form action={createPost}>
          <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700">
            New post
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500">
          Nothing written yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {rows.map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/posts/${post.id}`}
                className="flex items-center justify-between gap-6 py-4 transition hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="truncate font-medium text-gray-900">{post.title}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_STYLES[post.status] ?? STATUS_STYLES.draft
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  {post.subtitle && (
                    <p className="mt-1 truncate text-sm text-gray-500">{post.subtitle}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm text-gray-400">
                  {new Date(post.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
