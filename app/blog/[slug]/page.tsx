import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { excerpt } from '@/lib/prosemirror'
import { siteUrl } from '@/lib/site'
import PostContent from '@/components/blog/PostContent'
import type { Post } from '@/lib/types'

export const revalidate = 3600

async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient()
  // RLS already limits this to published and unlisted, so a draft slug is a
  // 404 for the public without the query having to say so.
  const { data } = await supabase.from('posts').select('*').eq('slug', slug).single()
  return (data as Post) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Not found' }

  const description = post.subtitle ?? excerpt(post.content_text)
  const url = `${siteUrl}/blog/${post.slug}`

  return {
    title: `${post.title} — Jeffrey Gong`,
    description,
    alternates: { canonical: url },
    // Unlisted posts are reachable by link but must not enter the index.
    robots: post.status === 'unlisted' ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
    twitter: {
      card: post.cover_image_url ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const description = post.subtitle ?? excerpt(post.content_text)

  return (
    <article className="py-12">
      <div className="mx-auto max-w-2xl px-6 md:px-8">
        <Link href="/blog" className="mb-10 inline-block text-sm text-gray-400 hover:text-gray-900">
          &larr; Blog
        </Link>

        <header className="mb-10">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {post.title}
          </h1>
          {post.subtitle && <p className="mb-5 text-xl text-gray-500">{post.subtitle}</p>}
          <p className="text-sm text-gray-400">
            {post.published_at &&
              new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
            &middot; {post.reading_minutes} min read
          </p>
        </header>

        {post.cover_image_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={post.cover_image_url} alt="" className="mb-10 w-full rounded-lg" />
        )}

        <PostContent content={post.content} />

        {post.tags.length > 0 && (
          <footer className="mt-16 flex flex-wrap gap-2 border-t border-gray-200 pt-8">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition hover:bg-gray-200"
              >
                {tag}
              </Link>
            ))}
          </footer>
        )}
      </div>

      <script
        type="application/ld+json"
        // Serialised by JSON.stringify from typed columns, not from user input,
        // and JSON-LD is inert -- this is the one place a string is injected.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: { '@type': 'Person', name: 'Jeffrey Gong', url: siteUrl },
            mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
          }).replace(/</g, '\\u003c'),
        }}
      />
    </article>
  )
}
