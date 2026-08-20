// Chunks a post and writes its embeddings.
//
// This runs as an Edge Function rather than a Next.js route handler for one
// reason: it keeps every privileged operation inside Supabase. The function
// forwards the caller's own JWT, so content_chunks_admin_all decides whether
// the write lands -- no service-role key is issued to Vercel, and a leak of
// the web app's environment therefore cannot reach the quorum schema.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CHUNK_CHARS = 1500
const CHUNK_OVERLAP = 200
const EMBEDDING_MODEL = 'gte-small'

const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Split on paragraph boundaries first and only fall back to a hard cut, so a
// chunk usually ends where a thought does. Overlap keeps a fact that straddles
// a boundary retrievable from either side.
function chunk(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > CHUNK_CHARS) {
      chunks.push(current)
      current = current.slice(-CHUNK_OVERLAP) + '\n\n' + paragraph
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph
    }
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks.flatMap((c) =>
    c.length <= CHUNK_CHARS * 1.5
      ? [c]
      : (c.match(new RegExp(`[\\s\\S]{1,${CHUNK_CHARS}}`, 'g')) ?? [])
  )
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const authorization = req.headers.get('Authorization')
  if (!authorization) {
    return new Response(JSON.stringify({ error: 'missing authorization' }), {
      status: 401,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authorization } } }
  )

  try {
    const { post_id } = await req.json()
    if (typeof post_id !== 'string') {
      return new Response(JSON.stringify({ error: 'post_id required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Reading through the caller's JWT means a non-admin gets zero rows here
    // and the function does nothing, rather than being rejected later.
    const { data: post, error: readError } = await supabase
      .from('posts')
      .select('id, title, subtitle, content_text')
      .eq('id', post_id)
      .single()

    if (readError || !post) {
      return new Response(JSON.stringify({ error: 'post not found' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Title and subtitle lead the corpus text: they carry the strongest signal
    // about what the post is, and gte-small only sees the chunk it is given.
    const header = [post.title, post.subtitle].filter(Boolean).join(' — ')
    const body = `${header}\n\n${post.content_text ?? ''}`.trim()
    const pieces = chunk(body)

    // Replace rather than upsert: an edit can shorten a post, and leftover
    // chunks from the longer version would keep answering for text that is no
    // longer on the page.
    const { error: deleteError } = await supabase
      .from('content_chunks')
      .delete()
      .eq('post_id', post_id)

    if (deleteError) throw deleteError

    if (pieces.length === 0) {
      return new Response(JSON.stringify({ ok: true, chunks: 0 }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const session = new Supabase.ai.Session(EMBEDDING_MODEL)

    const rows = []
    for (let i = 0; i < pieces.length; i++) {
      const embedding = (await session.run(pieces[i], {
        mean_pool: true,
        normalize: true,
      })) as number[]

      rows.push({
        source_kind: 'post',
        post_id,
        chunk_index: i,
        content: pieces[i],
        embedding: JSON.stringify(embedding),
        embedding_model: EMBEDDING_MODEL,
      })
    }

    const { error: insertError } = await supabase.from('content_chunks').insert(rows)
    if (insertError) throw insertError

    return new Response(JSON.stringify({ ok: true, chunks: rows.length }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
