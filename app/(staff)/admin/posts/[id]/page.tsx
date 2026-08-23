import Link from 'next/link'
import Arrow from '@/components/staff/Arrow'
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
          room, so it takes sheet ink rather than `--salon-ink`.

          The ring is `.salon-focus` like every other focusable thing in the
          staff area. It was the last hand-rolled one left, and it did not need
          to be: globals.css already swaps the ring to --salon-accent-sheet
          under `.salon-shell:has(.salon-sheet)`, which is exactly this page,
          and this link is exactly what that arm is for — on the paper without
          being inside `.salon-sheet`. */}
      <div className="mb-6">
        <Link
          href="/admin/posts"
          className="salon-focus text-[11px] uppercase tracking-[0.2em] text-[color:var(--salon-sheet-ink)] opacity-70 transition-opacity hover:opacity-100"
          style={{ fontFamily: 'var(--salon-font-mono)' }}
        >
          <Arrow direction="left" /> Posts
        </Link>
      </div>

      <PostEditor post={post as Post} />
    </>
  )
}
