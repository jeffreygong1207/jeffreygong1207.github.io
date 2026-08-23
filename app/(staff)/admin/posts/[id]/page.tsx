import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostEditor from '@/components/admin/PostEditor'
import type { Post } from '@/lib/types'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()
  if (!post) notFound()

  return (
    <>
      {/* PostEditor renders `.salon-sheet`, and globals.css watches for it with
          `:has()` — arriving here cross-fades the whole ground from #233226 to
          #EFEAE7 over 500ms. This link therefore sits on paper, not on the
          room, so it takes sheet ink rather than `--salon-ink`. */}
      <div className="mb-6">
        <Link
          href="/admin/posts"
          className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--salon-sheet-ink)] opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--salon-accent-d)]"
          style={{ fontFamily: 'var(--salon-font-mono)' }}
        >
          &larr; Posts
        </Link>
      </div>

      <PostEditor post={post as Post} />
    </>
  )
}
