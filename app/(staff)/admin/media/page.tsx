import Link from 'next/link'
import { PLATE_CARD } from '@/components/admin/plate'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Media' }

// Restyle only: the storage logic below is unchanged. `robots` is not exported
// here any more — app/(staff)/admin/layout.tsx already sets it for the whole
// staff area, and two exports of the same field is one place too many to keep
// in sync.

interface Asset {
  name: string
  path: string
  url: string
  size: number
  createdAt: string
  postId: string
  postTitle: string | null
}

// 1.3: inset hairline, not a drop shadow. Tailwind utilities rather than the
// unlayered `.salon-plate` class, because that class beats a `hover:` variant on
// the same element and every tile here is a link target.
//
// Two channels: the face lifts to --salon-raised and the hairline goes 0.14 ->
// 0.30 at the same time. `focus-within` as well as `hover`, because the anchor
// that takes focus is inside the tile, not the tile itself.

function formatBytes(bytes: number): string {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export default async function MediaPage() {
  const supabase = await createClient()
  const bucket = supabase.storage.from('post-images')

  // Uploads are keyed <post_id>/<uuid>.<ext>, so the top level is one folder
  // per post and the files sit one level down.
  const { data: folders, error: listError } = await bucket.list('', { limit: 200 })
  const postFolders = (folders ?? []).filter((f) => !f.id)

  const { data: posts } = await supabase.from('posts').select('id, title')
  const titleById = new Map((posts ?? []).map((p) => [p.id, p.title as string]))

  const nested = await Promise.all(
    postFolders.map(async (folder) => {
      const { data: files } = await bucket.list(folder.name, {
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      return (files ?? [])
        .filter((f) => f.id)
        .map((f): Asset => {
          const path = `${folder.name}/${f.name}`
          return {
            name: f.name,
            path,
            url: bucket.getPublicUrl(path).data.publicUrl,
            size: (f.metadata?.size as number) ?? 0,
            createdAt: f.created_at ?? '',
            postId: folder.name,
            postTitle: titleById.get(folder.name) ?? null,
          }
        })
    })
  )

  const assets = nested.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const totalBytes = assets.reduce((sum, a) => sum + a.size, 0)

  return (
    <>
      {/* The subtitle slot holds a COUNT, never prose. It used to explain where
          images come from when empty, which said the same thing the empty plate
          below already says. */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="salon-h1">Media</h1>
          <p className="salon-label mt-4">
            {`${assets.length} image${assets.length === 1 ? '' : 's'} · ${formatBytes(totalBytes)}`}
          </p>
        </div>
      </header>

      {assets.length === 0 ? (
        // §1.2/1.3: a plate, not a dashed card. Nothing here is a drop target,
        // so it should not draw itself as one.
        <p className="salon-plate px-6 py-16 text-center text-sm text-salon-muted">
          {listError
            ? 'Could not reach the media store. This is not an empty library.'
            : 'Nothing uploaded yet. Drag an image into a post and it lands here.'}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            // §1.2: the thumbnail sits on a plate — no border, no radius, no
            // drop shadow. `PLATE_CARD` carries the §1.3 inset hairline, which is what
            // an edge looks like on a dark ground, plus the hover and focus
            // states `.salon-plate` cannot express.
            <li key={asset.path} className={PLATE_CARD}>
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="salon-focus block"
              >
                {/* The image is the anchor's only visible content, so without
                    this the link computes an empty accessible name (WCAG F89).
                    Name it as text rather than aria-label, matching Bookcase,
                    and say it leaves the tab — the img stays alt="" so the name
                    is not announced twice. */}
                <span className="sr-only">
                  {asset.name} &mdash; {asset.postTitle ?? 'not used in a post'}. Full-size image,
                  opens in a new tab.
                </span>
                <div className="aspect-[4/3] bg-salon-sunken">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </a>
              <div className="px-3 py-2">
                {asset.postTitle ? (
                  <Link
                    href={`/admin/posts/${asset.postId}`}
                    className="salon-focus block truncate text-xs font-medium text-salon-ink"
                  >
                    {asset.postTitle}
                  </Link>
                ) : (
                  // The post was deleted but its objects were not: storage has
                  // no foreign key to posts, so nothing cascades. Said as what
                  // the reader can see about the file, not as the database state
                  // that produced it — a screen reader reads this line as the
                  // image's description.
                  <span className="block truncate text-xs font-medium text-salon-muted">
                    Not used in a post
                  </span>
                )}
                <p
                  className="mt-1 text-[11px] text-salon-muted"
                  style={{ fontFamily: 'var(--salon-font-mono)' }}
                >
                  {formatBytes(asset.size)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
