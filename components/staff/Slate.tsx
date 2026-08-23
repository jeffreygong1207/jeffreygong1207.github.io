import type { ExperienceRole } from '@/lib/experience'
import styles from './Slate.module.css'

/**
 * §2.4 — six roles on an unbranded generic slate.
 *
 * No client JS: the slate sits at zero rotation (see the geometry note at the
 * top of Slate.module.css), so there is no pointer-tilt to drive and the whole
 * component renders on the server. Motion is a single CSS `@starting-style`
 * block — the chassis fades in, then the six rows follow on a stagger — and it
 * fails open: the declared state is the final state, so a stylesheet that never
 * arrives yields no animation rather than a blank slate. The whole block sits
 * inside `prefers-reduced-motion: no-preference`, so under `reduce` the slate
 * is simply there at full opacity on the first frame.
 *
 * §1: the 3D is the shell. Everything on the screen is ordinary DOM with real
 * focus order and real selection; a role is focusable only when it has a `url`.
 */

function yearRange(roles: ExperienceRole[]): string {
  const years = roles
    .flatMap((role) => role.date.match(/\d{4}/g) ?? [])
    .map(Number)
  if (years.length === 0) return ''
  const first = Math.min(...years)
  const last = Math.max(...years)
  return first === last ? `${first}` : `${first}–${last}`
}

/**
 * A two-character monogram: one letter per word, or the first two letters when
 * the name is a single word. Two rather than one because `Stripe` and
 * `Snowflake` are adjacent rows — a single initial paints the identical chip
 * twice and reads as a rendering fault.
 */
function monogram(organization: string): string {
  const words = organization.split(/\s+/).filter(Boolean)
  const letters =
    words.length > 1
      ? words.slice(0, 2).map((word) => word.slice(0, 1))
      : [(words[0] ?? '').slice(0, 2)]
  return letters.join('').toUpperCase()
}

export default function Slate({ roles }: { roles: ExperienceRole[] }) {
  return (
    <div className={styles.plate}>
      <div className={styles.stage}>
        {/* The chassis edge. A sibling behind the face rather than a child of
            it, so the face's own background never paints over it. */}
        <div className={styles.edge} aria-hidden="true" />

        <div className={styles.device}>
          <div className={styles.screen}>
            <div className={styles.clip}>
              <div className={styles.head}>
                <span className={styles.headTitle}>Experience</span>
                <span className={styles.headRange}>{yearRange(roles)}</span>
              </div>

              {/* `role="list"` restores what `list-style: none` takes away:
                  Safari drops the list semantics from a list it does not paint
                  markers for, so without this the six roles reach VoiceOver as
                  six loose paragraphs with no count. */}
              <ol className={styles.roles} role="list">
                {roles.map((role) => (
                  <li
                    key={`${role.organization}-${role.date}`}
                    className={styles.role}
                  >
                    <div className={styles.roleHead}>
                      <span className={styles.roleName}>
                        {/* One treatment for all six rows: a monogram in the
                            display face, not a redrawn trademark. This repo is
                            public, and the marks on disk are three formats at
                            three different visual weights. Decorative — the
                            organisation's name is the accessible text, right
                            beside it. */}
                        <span className={styles.mark} aria-hidden="true">
                          {monogram(role.organization)}
                        </span>
                        {role.url ? (
                          <a
                            className={`${styles.org} ${styles.orgLink}`}
                            href={role.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {role.organization}
                          </a>
                        ) : (
                          <span className={styles.org}>{role.organization}</span>
                        )}
                      </span>
                      <span className={styles.date}>{role.date}</span>
                    </div>

                    <p className={styles.position}>{role.position}</p>

                    {role.description ? (
                      <p className={styles.note}>{role.description}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
