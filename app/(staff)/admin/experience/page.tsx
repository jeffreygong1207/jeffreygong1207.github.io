import Slate from '@/components/staff/Slate'
import { EXPERIENCE_ROLES } from '@/lib/experience'

// A pure offline render. There is no `experience` table — the migrations have
// no such object — so this page deliberately does not open a Supabase client.
// The data lives in lib/experience.ts, which mirrors components/Experience.tsx.

// Same rule as app/(staff)/admin/page.tsx: every figure on the page is derived
// from EXPERIENCE_ROLES rather than transcribed into the copy. lib/experience.ts
// is hand-maintained against components/Experience.tsx and has already changed
// length once, so a spelled-out count would go stale the next time a role lands.
function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

// `date` is prose — 'Summer 2026', 'Fall 2025' — so the year is pulled out of it
// rather than stored twice. Derived for the same reason the count is: a role
// landing in a new year must move this line without anyone remembering to.
function span(): string {
  const years = EXPERIENCE_ROLES.map((role) => Number(role.date.match(/\d{4}/)?.[0])).filter(
    (year) => Number.isFinite(year)
  )
  if (years.length === 0) return '—'
  const first = Math.min(...years)
  const last = Math.max(...years)
  return first === last ? `${first}` : `${first}–${last}`
}

export default function ExperiencePage() {
  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="salon-h1">Experience</h1>
          <p className="mt-1 text-sm text-salon-muted">
            {plural(EXPERIENCE_ROLES.length, 'role')}, newest first.
          </p>
        </div>

        <div className="flex items-baseline gap-7">
          <Stat value={String(EXPERIENCE_ROLES.length)} label="roles" />
          <Stat value={span()} label="span" />
        </div>
      </header>

      <Slate roles={EXPERIENCE_ROLES} />
    </>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <p className="flex flex-col items-end gap-0.5">
      <span
        className="text-[19px] tabular-nums text-salon-ink"
        style={{ fontFamily: 'var(--salon-font-mono)' }}
      >
        {value}
      </span>
      <span
        className="text-[10px] uppercase tracking-[0.13em] text-salon-muted"
        style={{ fontFamily: 'var(--salon-font-mono)' }}
      >
        {label}
      </span>
    </p>
  )
}
