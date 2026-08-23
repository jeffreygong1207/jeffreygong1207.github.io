import Bookcase from '@/components/staff/Bookcase'
import styles from '@/components/staff/Bookcase.module.css'
import { SHELVES, TOTAL_VOLUMES } from '@/lib/coursework'

export const metadata = { title: 'Coursework', robots: { index: false, follow: false } }

/**
 * /admin/coursework — the bookcase (spec §2.2).
 *
 * `salon-wide` opts this page out of the 64rem measure that `.salon-column`
 * imposes: the case is 566px rotated -21° at 3200px of perspective and does not
 * want a reading cage around it.
 *
 * The bookcase sits on a `.salon-plate` — a surface 1–4% off the page, DARKER
 * than the page (§1.2). Not a bordered card: no border, no border-radius and no
 * drop shadow, because a drop shadow is invisible on #233226. The plate's only
 * edge is the inset hairline that class already carries (§1.3).
 *
 * The header states what the page holds and decodes the one visual encoding a
 * reader cannot infer. It does not narrate the affordances, editorialise about
 * the data, or explain what the objects deliberately do not do.
 */
export default function CourseworkPage() {
  return (
    <div className="salon-wide">
      <header className={styles.header}>
        <h1 className="salon-h1">Coursework</h1>
        <p className={styles.standfirst}>
          {TOTAL_VOLUMES} volumes, bound by department and shelved across {SHELVES.length}{' '}
          academic years at Berkeley. Cloth colour is the department.
        </p>
        <p className={styles.legend}>
          <span className={styles.legendSwatch} aria-hidden="true" />
          <span>
            A <span className={styles.legendStrong}>gilt headband</span> marks a course with a
            mastery guide.
          </span>
        </p>
      </header>

      <div className="salon-plate">
        <Bookcase />
      </div>
    </div>
  )
}
