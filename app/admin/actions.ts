'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { slugify, toPlainText } from '@/lib/prosemirror'
import type { PostStatus, ProseMirrorNode } from '@/lib/types'

// Every write below goes through the caller's own session, so RLS decides
// whether it lands. There is no service-role escape hatch in this file on
// purpose -- posts_admin_all is the single place the rule is enforced.

export async function createPost() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .insert({ title: 'Untitled', slug: `untitled-${Date.now()}`, status: 'draft' })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  redirect(`/admin/posts/${data.id}`)
}

export interface SavePostInput {
  id: string
  title: string
  subtitle: string
  slug: string
  content: ProseMirrorNode
  coverImageUrl: string | null
  tags: string[]
  status: PostStatus
}

export async function savePost(input: SavePostInput) {
  const supabase = await createClient()

  const title = input.title.trim() || 'Untitled'
  const slug = slugify(input.slug || title) || `post-${Date.now()}`
  const contentText = toPlainText(input.content).trim()

  const { data: existing } = await supabase
    .from('posts')
    .select('published_at')
    .eq('id', input.id)
    .single()

  // posts_published_needs_date is a hard constraint, so the date is stamped
  // here rather than left to fail at the insert. It is stamped once and then
  // preserved: pulling a post back to draft and republishing it should not
  // silently re-date it to today and jump the feed.
  const publishedAt =
    input.status === 'published'
      ? (existing?.published_at ?? new Date().toISOString())
      : (existing?.published_at ?? null)

  const tags = Array.from(
    new Set(input.tags.map(slugify).filter(Boolean))
  ).slice(0, 8)

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      subtitle: input.subtitle.trim() || null,
      slug,
      content: input.content,
      content_text: contentText,
      cover_image_url: input.coverImageUrl,
      tags,
      status: input.status,
      published_at: publishedAt,
    })
    .eq('id', input.id)

  if (error) {
    // 23505 is the unique violation on posts.slug, which is the one failure
    // here that is the author's to fix rather than a bug.
    const message =
      error.code === '23505'
        ? `The slug “${slug}” is already taken.`
        : error.message
    return { ok: false as const, error: message }
  }

  revalidatePath('/admin')
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/feed.xml')

  return { ok: true as const, slug }
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/blog')
  redirect('/admin')
}
