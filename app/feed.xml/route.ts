import { createClient } from '@/lib/supabase/server'
import { excerpt } from '@/lib/prosemirror'
import { siteUrl, siteName, siteDescription } from '@/lib/site'
import type { Post } from '@/lib/types'

export const revalidate = 3600

// Titles and excerpts are author-written, but they still land inside XML, so
// the five predefined entities have to go. Ampersand first or it would
// double-escape the entities emitted after it.
function xml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('slug, title, subtitle, content_text, published_at, tags')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50)

  const posts = (data ?? []) as Post[]
  const updated = posts[0]?.published_at ?? new Date().toISOString()

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`
      const summary = post.subtitle ?? excerpt(post.content_text, 300)
      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <description>${xml(summary)}</description>
      <pubDate>${new Date(post.published_at!).toUTCString()}</pubDate>
${post.tags.map((t) => `      <category>${xml(t)}</category>`).join('\n')}
    </item>`
    })
    .join('\n')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(siteName)}</title>
    <link>${xml(siteUrl)}/blog</link>
    <description>${xml(siteDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
    <atom:link href="${xml(siteUrl)}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
