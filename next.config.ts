import type { NextConfig } from 'next'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const isDev = process.env.NODE_ENV !== 'production'

// Rendered post content comes from ProseMirror JSON through React, which
// escapes it, so CSP here is defence in depth rather than the primary control.
// script-src keeps 'unsafe-inline' because Next's bootstrap and the theme
// script in layout.tsx are inline; tightening that needs per-request nonces
// from middleware, which would force every route to render dynamically.
const csp = [
  "default-src 'self'",
  // Vercel Web Analytics is same-origin in production -- the script and the
  // beacons both live under /_vercel/insights -- so only `next dev`, which
  // pulls the debug build from va.vercel-scripts.com, needs the exception.
  `script-src 'self' 'unsafe-inline'${isDev ? ' https://va.vercel-scripts.com' : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE_URL} wss://*.supabase.co`,
  // Learnings render inside a sandboxed iframe via srcdoc; that frame is
  // same-document, so it needs no extra frame-src beyond 'self'.
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
