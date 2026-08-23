import Bookcase from '@/components/staff/Bookcase'
import styles from '@/components/staff/Bookcase.module.css'
import { GUIDE_COUNT, SHELVES, TOTAL_VOLUMES } from '@/lib/coursework'

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
 */
export default function CourseworkPage() {
  return (
    <div className="salon-wide">
      <header className={styles.header}>
        <h1 className={styles.title}>Coursework</h1>
        <p className={styles.standfirst}>
          {TOTAL_VOLUMES} volumes, bound by department and shelved across {SHELVES.length}{' '}
          academic years at Berkeley. Cloth colour is the department; width and height are the
          course.
        </p>
        <p className={styles.legend}>
          <span className={styles.legendSwatch} aria-hidden="true" />
          <span>
            <span className={styles.legendStrong}>
              {GUIDE_COUNT} of the {TOTAL_VOLUMES} carry a gilt headband
            </span>{' '}
            — those courses have a mastery guide, and the spine opens the PDF on Drive in a new
            tab. All {GUIDE_COUNT} are COMPSCI or EECS; none are UGBA. The remaining{' '}
            {TOTAL_VOLUMES - GUIDE_COUNT} spines are blind-stamped and do not link anywhere.
          </span>
        </p>
      </header>

      <div className="salon-plate">
        <Bookcase />
      </div>
    </div>
  )
}
