import Bookcase from '@/components/staff/Bookcase'
import Catalogue from '@/components/staff/Catalogue'
import VitrineEscape from '@/components/staff/VitrineEscape'
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
 *
 * TWO SURFACES, ONE PLATE. The case is the object; the catalogue is the reading
 * surface, and it is a SIBLING of the case, never a wrapper around it. The
 * catalogue's Vitrine panels animate their height, which needs
 * `overflow: hidden`, and overflow silently forces `transform-style: flat` on
 * whatever carries it — a shelf has already been flattened on this project that
 * exact way. Nothing in the catalogue subtree is 3D and nothing in it is an
 * ancestor of anything that is.
 *
 * One `VitrineEscape` for the whole page: the volumes are a single group, and
 * the component draws nothing and gates nothing. It hands Escape and focus
 * return to the group, and if its chunk never loads the face is still the
 * toggle.
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
        <Catalogue />
      </div>

      <VitrineEscape group="coursework" />
    </div>
  )
}
