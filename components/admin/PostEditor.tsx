'use client'

import { useCallback, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase/client'
import { savePost, deletePost } from '@/lib/actions'
import { slugify } from '@/lib/prosemirror'
import type { Post, PostStatus, ProseMirrorNode } from '@/lib/types'
import EditorToolbar from './EditorToolbar'

const EMPTY_DOC: ProseMirrorNode = { type: 'doc', content: [{ type: 'paragraph' }] }

export default function PostEditor({ post }: { post: Post }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [title, setTitle] = useState(post.title === 'Untitled' ? '' : post.title)
  const [subtitle, setSubtitle] = useState(post.subtitle ?? '')
  const [slug, setSlug] = useState(post.slug.startsWith('untitled-') ? '' : post.slug)
  const [tags, setTags] = useState(post.tags.join(', '))
  const [coverUrl, setCoverUrl] = useState(post.cover_image_url)
  const [status, setStatus] = useState<PostStatus>(post.status)
  const [message, setMessage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const coverInput = useRef<HTMLInputElement>(null)

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    // Path is generated, never taken from file.name: a caller-supplied name is
    // how you end up with traversal segments in an object key.
    const path = `${post.id}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, file, { cacheControl: '31536000', upsert: false })

    if (error) {
      setMessage(`Upload failed: ${error.message}`)
      return null
    }

    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    return data.publicUrl
  }, [post.id])

  const editor = useEditor({
    // Next renders this on the server first; letting TipTap paint immediately
    // produces a hydration mismatch.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg w-full' } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        // TipTap still stores whatever scheme is typed; the renderer re-checks
        // with safeHref, so this list is the first of two gates rather than
        // the only one.
        protocols: ['http', 'https', 'mailto'],
      }),
      Placeholder.configure({ placeholder: 'Tell your story…' }),
    ],
    content: (post.content?.content?.length ? post.content : EMPTY_DOC) as object,
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[24rem] text-[1.0625rem] leading-[1.75] text-gray-800',
      },
      handlePaste(view, event) {
        const file = event.clipboardData?.files?.[0]
        if (!file?.type.startsWith('image/')) return false
        event.preventDefault()
        void uploadImage(file).then((url) => {
          if (url) editor?.chain().focus().setImage({ src: url }).run()
        })
        return true
      },
      handleDrop(view, event) {
        const file = (event as DragEvent).dataTransfer?.files?.[0]
        if (!file?.type.startsWith('image/')) return false
        event.preventDefault()
        void uploadImage(file).then((url) => {
          if (url) editor?.chain().focus().setImage({ src: url }).run()
        })
        return true
      },
    },
  })

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file)
    if (url) setCoverUrl(url)
    setUploading(false)
    e.target.value = ''
  }

  function save(nextStatus: PostStatus) {
    if (!editor) return
    setMessage(null)
    setStatus(nextStatus)

    startTransition(async () => {
      const result = await savePost({
        id: post.id,
        title,
        subtitle,
        slug: slug || title,
        content: editor.getJSON() as ProseMirrorNode,
        coverImageUrl: coverUrl,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: nextStatus,
      })

      if (!result.ok) {
        setMessage(result.error)
        return
      }
      setSlug(result.slug)
      setMessage(nextStatus === 'published' ? 'Published' : 'Saved')

      // Re-embed only what readers can reach. Indexing a draft would put its
      // text in content_chunks, and the public read policy on that table keys
      // off the parent's status -- so a later publish is the right trigger,
      // not every keystroke-level save.
      if (nextStatus !== 'draft') {
        const supabase = createClient()
        const { error } = await supabase.functions.invoke('embed-content', {
          body: { post_id: post.id },
        })
        if (error) setMessage('Saved, but search indexing failed.')
      }

      router.refresh()
    })
  }

  return (
    <div className="grid gap-10 pb-24 lg:grid-cols-[1fr_18rem]">
      <div className="min-w-0">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="mb-3 w-full border-0 p-0 text-3xl font-bold tracking-tight text-gray-900 placeholder-gray-300 focus:outline-none md:text-4xl"
        />
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Subtitle"
          className="mb-8 w-full border-0 p-0 text-lg text-gray-500 placeholder-gray-300 focus:outline-none"
        />

        {coverUrl && (
          <div className="relative mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="w-full rounded-lg" />
            <button
              onClick={() => setCoverUrl(null)}
              className="absolute right-3 top-3 rounded-md bg-black/60 px-3 py-1 text-xs text-white"
            >
              Remove
            </button>
          </div>
        )}

        {editor && <EditorToolbar editor={editor} onUploadImage={uploadImage} />}
        <EditorContent editor={editor} />
      </div>

      <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
        <div className="flex gap-2">
          <button
            onClick={() => save('draft')}
            disabled={pending}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            onClick={() => save('published')}
            disabled={pending}
            className="flex-1 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:opacity-60"
          >
            {status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>

        {message && (
          <p className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700">{message}</p>
        )}

        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </Field>

        <Field label="URL slug" hint={slug ? `/blog/${slugify(slug)}` : 'Derived from the title'}>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={slugify(title) || 'my-post'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Tags" hint="Comma separated, up to 8">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="systems, berkeley"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Cover image">
          <input
            ref={coverInput}
            type="file"
            accept="image/*"
            onChange={handleCover}
            className="hidden"
          />
          <button
            onClick={() => coverInput.current?.click()}
            disabled={uploading}
            className="w-full rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : coverUrl ? 'Replace' : 'Upload'}
          </button>
        </Field>

        <div className="border-t border-gray-200 pt-6 text-sm text-gray-400">
          {post.reading_minutes} min read
        </div>

        {confirmDelete ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">Delete this post permanently?</p>
            <div className="flex gap-2">
              <form
                action={async () => {
                  await deletePost(post.id)
                }}
              >
                <button className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700">
                  Delete
                </button>
              </form>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-600 transition hover:text-red-800"
          >
            Delete post
          </button>
        )}
      </aside>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
