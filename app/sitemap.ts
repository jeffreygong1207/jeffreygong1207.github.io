import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { siteUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/coursework', '/projects', '/blog', '/contact'].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.7,
    })
  )

  const supabase = await createClient()
  // Published only. Unlisted posts are reachable by link on purpose and
  // listing them here would undo that.
  const { data } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const posts = (data ?? []).map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'yearly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...posts]
}
