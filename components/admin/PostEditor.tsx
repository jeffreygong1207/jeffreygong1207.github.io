'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
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
import Sheet, { SheetSurface } from '@/components/staff/Sheet'
import styles from '@/components/staff/Sheet.module.css'
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

  // Deleting a post is the only irreversible action in the product, and
  // opening the confirmation unmounts the button that opened it. Without this
  // focus falls to <body>: a keyboard user is dumped at the top of the
  // document and has to tab through the whole sidebar and editor to reach the
  // Delete/Cancel pair they just summoned, and a screen reader is told nothing
  // happened at all.
  const deleteTrigger = useRef<HTMLButtonElement>(null)
  const confirmBox = useRef<HTMLDivElement>(null)
  // Only a cancel returns focus to the trigger. A ref rather than state
  // because the first render must not move focus anywhere.
  const returnFocus = useRef(false)

  useEffect(() => {
    if (confirmDelete) {
      confirmBox.current?.focus()
      return
    }
    if (returnFocus.current) {
      returnFocus.current = false
      deleteTrigger.current?.focus()
    }
  }, [confirmDelete])

  function cancelDelete() {
    returnFocus.current = true
    setConfirmDelete(false)
  }

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
      Image.configure({ HTMLAttributes: { class: 'w-full' } }),
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
        // Size, leading, face and ink all come from `.salon-sheet` on the
        // wrapper — 18.5px on 1.66 in Newsreader across a 592px measure — so
        // nothing is restated here.
        class: 'prose-editor focus:outline-none min-h-[24rem]',
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
      // Only after the row actually took it. Setting this before the await left
      // the rail claiming a status the database had rejected -- a taken slug
      // would show "Published" over a post that was still a draft.
      setStatus(nextStatus)
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
    <SheetSurface className="grid gap-10 pb-24 lg:grid-cols-[1fr_18rem]">
      <Sheet>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          aria-label="Title"
          className={styles.title}
        />
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Subtitle"
          aria-label="Subtitle"
          className={styles.subtitle}
        />

        {coverUrl && (
          <div className={styles.cover}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className={styles.coverImage} />
            <button
              type="button"
              onClick={() => setCoverUrl(null)}
              className={styles.coverRemove}
            >
              Remove<span className="sr-only"> cover image</span>
            </button>
          </div>
        )}

        {editor && <EditorToolbar editor={editor} onUploadImage={uploadImage} />}
        <EditorContent editor={editor} />
      </Sheet>

      <aside className={`${styles.rail} space-y-6 lg:sticky lg:top-8 lg:self-start`}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={pending}
            className={`${styles.btn} ${styles.btnGhost} flex-1`}
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => save('published')}
            disabled={pending}
            className={`${styles.btn} ${styles.btnPrimary} flex-1`}
          >
            {status === 'published' ? 'Update' : 'Publish'}
          </button>
        </div>

        {/* Kept in the tree so the region exists before it has anything to say;
            a live region inserted together with its text often goes unread. */}
        <p aria-live="polite" className={message ? styles.message : 'sr-only'}>
          {message}
        </p>

        <Field id="post-status" label="Status">
          <select
            id="post-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PostStatus)}
            className={styles.control}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </Field>

        <Field
          id="post-slug"
          label="URL slug"
          hint={slug ? `/blog/${slugify(slug)}` : 'Derived from the title'}
        >
          <input
            id="post-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={slugify(title) || 'my-post'}
            aria-describedby="post-slug-hint"
            className={styles.control}
          />
        </Field>

        <Field id="post-tags" label="Tags" hint="Comma separated, up to 8">
          <input
            id="post-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="systems, berkeley"
            aria-describedby="post-tags-hint"
            className={styles.control}
          />
        </Field>

        <Field id="post-cover" label="Cover image">
          <input
            ref={coverInput}
            type="file"
            accept="image/*"
            onChange={handleCover}
            className="hidden"
            aria-label="Choose a cover image file"
          />
          {/* A <label for> does not name a button, so the visible label is
              pulled in explicitly and the button's own text is kept after it. */}
          <button
            type="button"
            id="post-cover"
            aria-labelledby="post-cover-label post-cover"
            onClick={() => coverInput.current?.click()}
            disabled={uploading}
            className={`${styles.btn} ${styles.btnPlate}`}
          >
            {uploading ? 'Uploading…' : coverUrl ? 'Replace' : 'Upload'}
          </button>
        </Field>

        {/* reading_minutes is GENERATED ALWAYS STORED: read it, never write it. */}
        <p className={styles.readTime}>{post.reading_minutes} min read</p>

        {confirmDelete ? (
          // A named group, not role="alertdialog": an alertdialog carries an
          // APG expectation of modality and a focus trap, and this is an
          // inline block in the rail with the rest of the editor still live
          // behind it. Claiming the role without the behaviour is worse than
          // not claiming it. The name comes from the question itself, so
          // moving focus here announces what is being asked.
          <div
            ref={confirmBox}
            role="group"
            aria-labelledby="delete-confirm-label"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelDelete()
            }}
            className={`${styles.confirm} space-y-2`}
          >
            <p id="delete-confirm-label" className={styles.confirmText}>
              Delete this post permanently?
            </p>
            <div className="flex gap-2">
              <form
                action={async () => {
                  await deletePost(post.id)
                }}
              >
                <button className={`${styles.btn} ${styles.btnDangerSolid}`}>Delete</button>
              </form>
              <button
                type="button"
                onClick={cancelDelete}
                className={`${styles.btn} ${styles.btnGhost}`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            ref={deleteTrigger}
            type="button"
            onClick={() => setConfirmDelete(true)}
            className={`${styles.btn} ${styles.btnDanger}`}
          >
            Delete post
          </button>
        )}
      </aside>
    </SheetSurface>
  )
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      {/* The label was previously bound to nothing at all: no htmlFor, no
          wrapping. Status, slug, tags and cover each had zero programmatic
          name. The id is threaded through so every control has one. */}
      <label id={`${id}-label`} htmlFor={id} className={styles.railLabel}>
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className={styles.railHint}>
          {hint}
        </p>
      )}
    </div>
  )
}
