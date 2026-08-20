'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Hit {
  slug: string
  title: string
  excerpt: string
  score: number
}

export default function BlogSearch() {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Hit[] | null>(null)
  const [busy, setBusy] = useState(false)
  // Tracks the newest request so a slow earlier response cannot overwrite the
  // results of a later, more specific query.
  const latest = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 3) {
      setHits(null)
      setBusy(false)
      return
    }

    const id = ++latest.current
    setBusy(true)
    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke('search-content', {
        body: { query: trimmed, limit: 8 },
      })

      if (id !== latest.current) return
      setHits(error ? [] : ((data?.results ?? []) as Hit[]))
      setBusy(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="mb-8">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts…"
          aria-label="Search posts"
          className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-gray-900 focus:outline-none"
        />
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </div>

      {busy && <p className="mt-3 text-sm text-gray-400">Searching…</p>}

      {!busy && hits !== null && (
        hits.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">No matches.</p>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 rounded-md border border-gray-200">
            {hits.map((hit) => (
              <li key={hit.slug}>
                <Link href={`/blog/${hit.slug}`} className="block px-4 py-3 transition hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{hit.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{hit.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
