export type PostStatus = 'draft' | 'published' | 'unlisted'

export interface Post {
  id: string
  slug: string
  title: string
  subtitle: string | null
  content: ProseMirrorNode
  content_text: string
  cover_image_url: string | null
  status: PostStatus
  published_at: string | null
  tags: string[]
  reading_minutes: number
  created_at: string
  updated_at: string
}

export interface ProseMirrorMark {
  type: string
  attrs?: Record<string, unknown>
}

export interface ProseMirrorNode {
  type?: string
  attrs?: Record<string, unknown>
  content?: ProseMirrorNode[]
  marks?: ProseMirrorMark[]
  text?: string
}
