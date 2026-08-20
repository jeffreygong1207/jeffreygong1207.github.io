# Personal Website

Next.js site with a Supabase-backed blog. Deployed on Vercel.

## Running locally

```sh
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_SITE_URL=http://localhost:3000
npm install
npm run dev
```

## Architecture

| Piece | Where |
| --- | --- |
| Pages, editor, RSS | `app/`, `components/` |
| Supabase clients | `lib/supabase/` |
| Session refresh + `/admin` gate | `proxy.ts` |
| Schema and RLS | `supabase/migrations/` |
| Embedding + search | `supabase/functions/` |

Writing lives at `/admin`, gated by the `site_admins` allowlist. Sign-in is
Google-only. `is_admin()` is checked in three places — the proxy, the admin
layout, and every RLS policy — and only the last one actually protects
anything; the first two just avoid rendering a dashboard for someone who would
see nothing.

### Why there is no service-role key

This Supabase project also holds the `quorum` schema. A service-role key
bypasses RLS project-wide, so putting one in the web app's environment would
mean a leak in the site reaches the trading tables. Nothing here needs one:

- **Embedding writes** run in the `embed-content` Edge Function, which forwards
  the caller's JWT so `content_chunks_admin_all` decides whether the write lands.
- **Search** runs in `search-content`, which calls `match_content` — declared
  `security invoker`, so RLS scopes results to what the caller may see.

Keep it that way. If something seems to need service-role, it belongs in an
Edge Function.

## Deploying

Vercel builds from `main`. Environment variables required in the Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

GitHub Pages serves only `pages-redirect/`, which forwards old
`jeffreygong1207.github.io` links. **Do not push that redirect until the Vercel
deployment resolves** — it points traffic at a host that must already exist.
