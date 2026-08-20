// Hybrid search over the corpus.
//
// Embeds the query with the same gte-small model the chunks were written with,
// then hands both the vector and the raw text to match_content, which fuses
// them by RRF. match_content is security invoker, so RLS -- not this function
// -- decides what the caller is allowed to match against. An anonymous reader
// therefore cannot reach a draft post or a private learning even though the
// same function serves the admin.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const EMBEDDING_MODEL = 'gte-small'
const MAX_QUERY_CHARS = 500

const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  // Anonymous search is the normal case, so a missing Authorization header is
  // fine -- the request then runs as anon and RLS scopes it to public content.
  const authorization =
    req.headers.get('Authorization') ?? `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authorization } } }
  )

  try {
    const body = await req.json()
    const query = typeof body.query === 'string' ? body.query.trim().slice(0, MAX_QUERY_CHARS) : ''
    const limit = Math.min(Math.max(Number(body.limit) || 8, 1), 20)

    if (!query) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const session = new Supabase.ai.Session(EMBEDDING_MODEL)
    const embedding = (await session.run(query, {
      mean_pool: true,
      normalize: true,
    })) as number[]

    const { data, error } = await supabase.rpc('match_content', {
      query_embedding: JSON.stringify(embedding),
      query_text: query,
      match_count: limit,
      filter_kind: 'post',
    })

    if (error) throw error

    // Chunks collapse to one hit per post: three matching chunks from the same
    // essay is one result to a reader, not three.
    const seen = new Set<string>()
    const results = []
    for (const row of data ?? []) {
      if (seen.has(row.source_id)) continue
      seen.add(row.source_id)
      results.push({
        slug: row.slug,
        title: row.title,
        excerpt: row.content.slice(0, 240),
        score: row.score,
      })
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
