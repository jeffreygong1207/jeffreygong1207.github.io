// Absolute URLs for canonical tags, OG metadata, and the RSS feed. Vercel sets
// VERCEL_PROJECT_PRODUCTION_URL on every deploy, so preview builds still emit
// links that point at production rather than at the preview hostname.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

export const siteName = 'Jeffrey Gong'
export const siteDescription =
  'Writing on systems, finance engineering, and whatever I am studying.'
