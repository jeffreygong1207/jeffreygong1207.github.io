import type { ProseMirrorNode } from './types'

// Flattens the editor document to plain text. Feeds content_text, which in
// turn feeds the reading-time column, meta descriptions, and the embedding
// chunks -- so it runs on every write rather than being derived at read time.
export function toPlainText(node: ProseMirrorNode | null | undefined): string {
  if (!node) return ''

  if (node.type === 'text') return node.text ?? ''

  const children = (node.content ?? []).map(toPlainText).filter(Boolean)

  // Block-level nodes become their own line so that words never run together
  // across a paragraph boundary and inflate the word count.
  const isBlock =
    node.type === 'paragraph' ||
    node.type === 'heading' ||
    node.type === 'blockquote' ||
    node.type === 'listItem' ||
    node.type === 'codeBlock'

  return isBlock ? children.join(' ') + '\n' : children.join('')
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

export function excerpt(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, clean.lastIndexOf(' ', max)) + '…'
}

// Only http(s) and mailto survive. Everything else -- javascript:, data:,
// vbscript: -- becomes undefined, so a link mark that made it into the stored
// document can never render as an executable href.
export function safeHref(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  try {
    const url = new URL(raw, 'https://example.invalid')
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') {
      return raw
    }
  } catch {
    return undefined
  }
  return undefined
}

// Images are rendered from stored attrs, so the same reasoning as safeHref
// applies: restrict to the bucket's own https URLs and relative paths.
export function safeImageSrc(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined
  if (raw.startsWith('/')) return raw
  try {
    const url = new URL(raw)
    if (url.protocol === 'https:') return raw
  } catch {
    return undefined
  }
  return undefined
}
