import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Neither is secret -- the allowlist and RLS are what actually protect
      // them -- but there is no reason to spend crawl budget on a login form.
      disallow: ['/admin', '/login', '/auth/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
