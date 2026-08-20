'use client'

import { useRef } from 'react'
import { useEditorState, type Editor } from '@tiptap/react'
import { safeHref } from '@/lib/prosemirror'

export default function EditorToolbar({
  editor,
  onUploadImage,
}: {
  editor: Editor
  onUploadImage: (file: File) => Promise<string | null>
}) {
  const fileInput = useRef<HTMLInputElement>(null)

  // Subscribing to just these flags keeps the toolbar from re-rendering on
  // every keystroke, which is what a plain editor.isActive() read would do.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      quote: e.isActive('blockquote'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      codeBlock: e.isActive('codeBlock'),
      link: e.isActive('link'),
    }),
  })

  function setLink() {
    const previous = editor.getAttributes('link').href as string | undefined
    const input = window.prompt('Link URL', previous ?? 'https://')
    if (input === null) return

    if (input === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    const href = safeHref(input)
    if (!href) return
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
  }

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await onUploadImage(file)
    if (url) editor.chain().focus().setImage({ src: url }).run()
    e.target.value = ''
  }

  return (
    <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-center gap-1 border-y border-gray-200 bg-white/95 py-2 backdrop-blur">
      <Btn on={state.bold} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
        <span className="font-bold">B</span>
      </Btn>
      <Btn on={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
        <span className="font-serif italic">I</span>
      </Btn>
      <Btn on={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()} label="Strikethrough">
        <span className="line-through">S</span>
      </Btn>
      <Btn on={state.code} onClick={() => editor.chain().focus().toggleCode().run()} label="Inline code">
        <span className="font-mono text-xs">{'</>'}</span>
      </Btn>

      <Divider />

      <Btn on={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="Heading 2">
        H2
      </Btn>
      <Btn on={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="Heading 3">
        H3
      </Btn>

      <Divider />

      <Btn on={state.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote">
        &ldquo;
      </Btn>
      <Btn on={state.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list">
        &bull;
      </Btn>
      <Btn on={state.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list">
        1.
      </Btn>
      <Btn on={state.codeBlock} onClick={() => editor.chain().focus().toggleCodeBlock().run()} label="Code block">
        <span className="font-mono text-xs">{'{ }'}</span>
      </Btn>

      <Divider />

      <Btn on={state.link} onClick={setLink} label="Link">
        &#128279;
      </Btn>
      <Btn on={false} onClick={() => fileInput.current?.click()} label="Image">
        &#9634;
      </Btn>
      <Btn on={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Divider">
        &mdash;
      </Btn>

      <input ref={fileInput} type="file" accept="image/*" onChange={pickImage} className="hidden" />
    </div>
  )
}

function Btn({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={on}
      className={`flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm transition ${
        on ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-gray-200" />
}
