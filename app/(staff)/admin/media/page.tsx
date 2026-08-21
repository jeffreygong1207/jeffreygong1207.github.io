import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { robots: { index: false, follow: false } }

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
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Media</h1>
        <p className="mt-1 text-sm text-gray-500">
          {assets.length === 0
            ? 'Images uploaded from the editor appear here.'
            : `${assets.length} image${assets.length === 1 ? '' : 's'} · ${formatBytes(totalBytes)}`}
        </p>
      </div>

      {assets.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-sm text-gray-500">
          Nothing uploaded yet. Drag an image into a post and it lands here.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <li
              key={asset.path}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <a href={asset.url} target="_blank" rel="noopener noreferrer">
                <div className="aspect-[4/3] bg-gray-100">
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
                    className="block truncate text-xs font-medium text-gray-900 hover:underline"
                  >
                    {asset.postTitle}
                  </Link>
                ) : (
                  // The post was deleted but its objects were not: storage has
                  // no foreign key to posts, so nothing cascades.
                  <span className="block truncate text-xs font-medium text-gray-400">
                    Orphaned
                  </span>
                )}
                <p className="mt-0.5 text-xs text-gray-400">{formatBytes(asset.size)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
