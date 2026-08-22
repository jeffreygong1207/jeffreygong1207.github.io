import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
  const { data: folders } = await bucket.list('', { limit: 200 })
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
      <div className="mb-8">
        <h1
          className="text-[30px] font-normal leading-tight tracking-[-0.018em] text-salon-ink"
          style={{ fontFamily: 'var(--salon-font-read)' }}
        >
          Media
        </h1>
        <p className="mt-1 text-sm text-salon-muted">
          {assets.length === 0
            ? 'Images uploaded from the editor appear here.'
            : `${assets.length} image${assets.length === 1 ? '' : 's'} · ${formatBytes(totalBytes)}`}
        </p>
      </div>

      {assets.length === 0 ? (
        // §1.2/1.3: a plate, not a dashed card. Nothing here is a drop target,
        // so it should not draw itself as one.
        <p className="salon-plate px-6 py-16 text-center text-sm text-salon-muted">
          Nothing uploaded yet. Drag an image into a post and it lands here.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            // §1.2: the thumbnail sits on a plate — no border, no radius, no
            // drop shadow. `.salon-plate` carries the §1.3 inset hairline,
            // which is what an edge looks like on a dark ground.
            <li key={asset.path} className="salon-plate">
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salon-accent"
              >
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
                    className="block truncate text-xs font-medium text-salon-ink transition-colors hover:text-salon-accent"
                  >
                    {asset.postTitle}
                  </Link>
                ) : (
                  // The post was deleted but its objects were not: storage has
                  // no foreign key to posts, so nothing cascades.
                  <span className="block truncate text-xs font-medium text-salon-muted">
                    Orphaned
                  </span>
                )}
                <p
                  className="mt-0.5 text-[11px] text-salon-muted"
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
