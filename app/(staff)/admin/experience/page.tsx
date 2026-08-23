import Slate from '@/components/staff/Slate'
import { EXPERIENCE_ROLES } from '@/lib/experience'

// A pure offline render. There is no `experience` table — the migrations have
// no such object — so this page deliberately does not open a Supabase client.
// The data lives in lib/experience.ts, which mirrors components/Experience.tsx.

// Same rule as app/(staff)/admin/page.tsx: every figure in the prose is derived
// from EXPERIENCE_ROLES rather than transcribed into the copy. lib/experience.ts
// is hand-maintained against components/Experience.tsx and has already changed
// length once, so a spelled-out count would go stale the next time a role lands.
function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

export default function ExperiencePage() {
  const described = EXPERIENCE_ROLES.filter((role) => role.description).length
  const undescribed = EXPERIENCE_ROLES.length - described
  // The second half of the gap note is a claim about `described`, and the list
  // below schedules the copy that falsifies it — so it is read off the data too.
  const gap =
    undescribed === 0
      ? `All ${plural(EXPERIENCE_ROLES.length, 'role')} are written up.`
      : undescribed === EXPERIENCE_ROLES.length
        ? `${plural(undescribed, 'role')}, nothing written about any of them.`
        : `${plural(undescribed, 'role')} of ${EXPERIENCE_ROLES.length} with nothing written about them.`

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <h1
            className="text-[30px] font-normal leading-tight tracking-[-0.018em] text-salon-ink"
            style={{ fontFamily: 'var(--salon-font-read)' }}
          >
            Experience
          </h1>
          <p className="mt-1 text-sm text-salon-muted">
            {plural(EXPERIENCE_ROLES.length, 'role')}, on the slate. The shell
            is CSS 3D; the screen is ordinary HTML you can select, search and tab
            through.
          </p>
        </div>

        <div className="flex items-baseline gap-7">
          <p className="flex flex-col items-end gap-0.5">
            <span
              className="text-[19px] tabular-nums text-salon-ink"
              style={{ fontFamily: 'var(--salon-font-mono)' }}
            >
              {EXPERIENCE_ROLES.length}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.13em] text-salon-muted"
              style={{ fontFamily: 'var(--salon-font-mono)' }}
            >
              roles
            </span>
          </p>
          <p className="flex flex-col items-end gap-0.5">
            <span
              className="text-[19px] tabular-nums text-salon-accent"
              style={{ fontFamily: 'var(--salon-font-mono)' }}
            >
              {described}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.13em] text-salon-muted"
              style={{ fontFamily: 'var(--salon-font-mono)' }}
            >
              written up
            </span>
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <Slate roles={EXPERIENCE_ROLES} />

        {/* Body copy on the ground is --salon-ink, not --salon-muted: muted is
            secondary text only (§3). The labels are the secondary text. */}
        <aside className="flex flex-col gap-6">
          <section>
            <h2
              className="text-[10px] font-normal uppercase tracking-[0.14em] text-salon-muted"
              style={{ fontFamily: 'var(--salon-font-mono)' }}
            >
              Why a slate
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-salon-ink">
              Books are finished. A career is not, so it gets the object you read
              things on rather than a bound volume — it stays in the room without
              pretending to be closed.
            </p>
          </section>

          <section>
            <h2
              className="text-[10px] font-normal uppercase tracking-[0.14em] text-salon-accent"
              style={{ fontFamily: 'var(--salon-font-mono)' }}
            >
              The gap this exposes
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-salon-ink">
              <span style={{ fontFamily: 'var(--salon-font-mono)' }}>
                components/Experience.tsx
              </span>{' '}
              stores organisation, position and date and nothing else. {gap} The
              slate marks any absence rather than hiding it behind a one-line
              list.
            </p>
          </section>

          <section
            className="p-3.5"
            style={{ background: 'var(--salon-plate)' }}
          >
            <h2
              className="text-[10px] font-normal uppercase tracking-[0.14em] text-salon-muted"
              style={{ fontFamily: 'var(--salon-font-mono)' }}
            >
              Needed before this ships
            </h2>
            <ol className="mt-2 flex flex-col gap-1.5">
              {[
                'Copy for each role — two or three sentences, written by you',
                'A url per role, which is also what makes the row focusable',
                'A call on what stays private. Stripe work especially',
              ].map((item, index) => (
                <li key={item} className="flex items-baseline gap-2">
                  <span
                    className="text-[10px] text-salon-subtle"
                    style={{ fontFamily: 'var(--salon-font-mono)' }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[12.5px] leading-snug text-salon-ink">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[11.5px] leading-snug text-salon-muted">
              Both fields already exist on the staff-side type in{' '}
              <span style={{ fontFamily: 'var(--salon-font-mono)' }}>
                lib/experience.ts
              </span>
              .
            </p>
          </section>

          <p className="text-[11.5px] leading-snug text-salon-muted">
            Drawn as a generic slate, not a specific device. Copying a real
            product shell puts someone else&rsquo;s industrial design on the
            site, and a painted-on status bar doubles up against the real one.
          </p>
        </aside>
      </div>
    </>
  )
}
