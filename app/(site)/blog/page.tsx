import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { excerpt } from '@/lib/prosemirror'
import { siteUrl } from '@/lib/site'
import BlogSearch from '@/components/blog/BlogSearch'
import type { Post } from '@/lib/types'

export const metadata = {
  title: 'Blog — Jeffrey Gong',
  description: 'Essays and notes.',
  alternates: { canonical: `${siteUrl}/blog`, types: { 'application/rss+xml': `${siteUrl}/feed.xml` } },
}

// Published posts change only when I publish, and savePost revalidates this
// path, so there is no reason to hit Postgres on every request.
export const revalidate = 3600

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('posts')
    .select('id, slug, title, subtitle, content_text, cover_image_url, published_at, reading_minutes, tags')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (tag) query = query.contains('tags', [tag])

  const { data } = await query
  const posts = (data ?? []) as Post[]

  // Tag cloud is derived from what is actually published rather than stored,
  // so a tag disappears from the filter as soon as its last post is unpublished.
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort()

  return (
    <section className="py-12">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="mb-8 flex items-baseline justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <a href="/feed.xml" className="text-sm text-gray-400 hover:text-gray-900">
            RSS
          </a>
        </div>

        <BlogSearch />

        {allTags.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <TagChip href="/blog" active={!tag}>
              All
            </TagChip>
            {allTags.map((t) => (
              <TagChip key={t} href={`/blog?tag=${encodeURIComponent(t)}`} active={tag === t}>
                {t}
              </TagChip>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="py-16 text-center text-gray-500">
            {tag ? `Nothing tagged “${tag}” yet.` : 'Nothing published yet.'}
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.id} className="py-8 first:pt-0">
                <Link href={`/blog/${post.slug}`} className="group flex gap-6">
                  <div className="min-w-0 flex-1">
                    <h2 className="mb-1 text-xl font-bold tracking-tight text-gray-900 group-hover:text-gray-600">
                      {post.title}
                    </h2>
                    {post.subtitle && (
                      <p className="mb-2 text-gray-500">{post.subtitle}</p>
                    )}
                    <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                      {excerpt(post.content_text, 180)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {post.published_at && formatDate(post.published_at)} &middot;{' '}
                      {post.reading_minutes} min read
                    </p>
                  </div>
                  {post.cover_image_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.cover_image_url}
                      alt=""
                      className="hidden h-28 w-40 shrink-0 rounded object-cover sm:block"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function TagChip({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-sm transition ${
        active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </Link>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
