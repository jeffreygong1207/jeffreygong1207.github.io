import { Fragment, type ReactNode } from 'react'
import type { ProseMirrorMark, ProseMirrorNode } from '@/lib/types'
import { safeHref, safeImageSrc } from '@/lib/prosemirror'

// The editor document is rendered by walking the JSON and emitting React
// elements. Nothing here ever produces an HTML string, so a stored document
// cannot inject markup no matter what was written into the column -- which is
// what the posts.content comment in the schema is asking for.

function applyMarks(text: string, marks: ProseMirrorMark[] | undefined, key: number): ReactNode {
  if (!marks?.length) return <Fragment key={key}>{text}</Fragment>

  return marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case 'bold':
        return <strong>{acc}</strong>
      case 'italic':
        return <em>{acc}</em>
      case 'strike':
        return <s>{acc}</s>
      case 'code':
        return (
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em]">
            {acc}
          </code>
        )
      case 'link': {
        const href = safeHref(mark.attrs?.href)
        if (!href) return acc
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-blue-600 underline underline-offset-2 hover:text-blue-800"
          >
            {acc}
          </a>
        )
      }
      default:
        return acc
    }
  }, <Fragment key={key}>{text}</Fragment>)
}

function renderNodes(nodes: ProseMirrorNode[] | undefined): ReactNode {
  if (!nodes?.length) return null
  return nodes.map((node, i) => <RenderNode key={i} node={node} index={i} />)
}

function RenderNode({ node, index }: { node: ProseMirrorNode; index: number }) {
  switch (node.type) {
    case 'text':
      return <>{applyMarks(node.text ?? '', node.marks, index)}</>

    case 'paragraph':
      return <p className="mb-6 leading-[1.75] text-gray-800">{renderNodes(node.content)}</p>

    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 2), 4)
      const sizes: Record<number, string> = {
        2: 'text-2xl md:text-3xl mt-12 mb-4',
        3: 'text-xl md:text-2xl mt-10 mb-3',
        4: 'text-lg md:text-xl mt-8 mb-2',
      }
      const Tag = `h${level}` as 'h2' | 'h3' | 'h4'
      return (
        <Tag className={`font-bold tracking-tight text-gray-900 ${sizes[level]}`}>
          {renderNodes(node.content)}
        </Tag>
      )
    }

    case 'blockquote':
      return (
        <blockquote className="my-8 border-l-[3px] border-gray-300 pl-6 italic text-gray-600">
          {renderNodes(node.content)}
        </blockquote>
      )

    case 'bulletList':
      return <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-800">{renderNodes(node.content)}</ul>

    case 'orderedList':
      return <ol className="mb-6 list-decimal space-y-2 pl-6 text-gray-800">{renderNodes(node.content)}</ol>

    case 'listItem':
      return <li className="leading-[1.75] [&>p]:mb-0">{renderNodes(node.content)}</li>

    case 'codeBlock':
      return (
        <pre className="mb-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          <code>{renderNodes(node.content)}</code>
        </pre>
      )

    case 'horizontalRule':
      return <hr className="my-12 border-gray-200" />

    case 'hardBreak':
      return <br />

    case 'image': {
      const src = safeImageSrc(node.attrs?.src)
      if (!src) return null
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : ''
      return (
        <figure className="my-8">
          {/* Plain img rather than next/image: the dimensions are not known
              ahead of time and these are already sized on upload. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="w-full rounded-lg" loading="lazy" />
          {alt && <figcaption className="mt-2 text-center text-sm text-gray-500">{alt}</figcaption>}
        </figure>
      )
    }

    case 'doc':
      return <>{renderNodes(node.content)}</>

    // An unrecognised node still renders its children, so a document written
    // by a newer editor build degrades to its text instead of vanishing.
    default:
      return <>{renderNodes(node.content)}</>
  }
}

export default function PostContent({ content }: { content: ProseMirrorNode }) {
  return <div className="text-[1.0625rem]">{renderNodes(content?.content)}</div>
}
