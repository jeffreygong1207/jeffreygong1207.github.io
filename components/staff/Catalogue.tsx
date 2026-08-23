import Vitrine, { vitrineId } from './Vitrine'
import { SHELVES, departmentName, guideUrl, type Volume } from '@/lib/coursework'
import styles from './Catalogue.module.css'

/**
 * The catalogue — the readable surface for the 39 volumes, and the surface a
 * volume opens on. Server component; nothing here hydrates.
 *
 * ---------------------------------------------------------------------------
 * WHY IT IS A SEPARATE SURFACE AND NOT A BIGGER SPINE
 *
 * The clamp at Bookcase.tsx (`cap = min(w * 0.30, 13.5)`) and its two-pass
 * auto-fit are untouched by this file, byte for byte. Raising the clamp would
 * be both wrong and useless. Wrong, because scaling type with spine width is
 * the #1 tell of a CG book — real spines stop growing the type past ~15mm and
 * spend the width on margin. Useless, because the clamp binds on only 6-10 of
 * the 39 spines: 31 of 38 are bound by the overflow budget instead, i.e. by a
 * 19-character median title running down a 196-232px spine. That is geometry.
 *
 * And size alone could not fix it anyway. `writing-mode: vertical-rl` is the
 * 90deg-rotated reading condition, where horizontal is 1.81x faster (Yu, Park,
 * Gerold & Legge, JOV 2010, n=24; Byrne 2002 corroborates at +81%). A
 * sub-critical size and a 1.8x rotation penalty multiply.
 *
 * So the spine stops being a reading surface and a new one is added. Spine
 * titles are decorative — the same status the course codes already held — and
 * every one of the 39 full titles is live text here, at one size, horizontal,
 * derived from nothing the spine geometry knows.
 *
 * This is what a bookshelf of spines actually ships. Stripe Press's homepage
 * is one, and across all 14 books every title is `font-size: 16px;
 * writing-mode: horizontal-tb; transform: none` — the artwork varies in
 * thickness, the label does not. Apple Music, Spotify, Apple Books, Discogs and
 * Bandcamp all do the same: cover art at true scale with its baked-in type
 * illegible, title and artist repeated as live HTML directly beneath.
 *
 * ---------------------------------------------------------------------------
 * THE OPENED VOLUME
 *
 * Each row IS a Vitrine, `name="coursework"`, so one volume is open at a time.
 * The id goes on the <summary> and never on the <details>: the HTML
 * ancestor-details-revealing algorithm expands a closed <details> only when the
 * fragment target is INSIDE it. That is what lets a spine's `#vol-...` anchor
 * open a volume with zero script, and it gives every opened volume a URL, so
 * Back is the close gesture.
 *
 * The book does not open on the shelf, and no fake hinge is drawn anywhere.
 * Three measurements forbid it: spines are 18-72px, so hinging the spine face
 * about its drawn groove projects to 5.6px at 72deg on the ten narrowest; an
 * opened spread is 261-309px against a 566px case and would cover five to seven
 * neighbours; and translateZ(64px) at 3200px of perspective buys +1.90% scale,
 * so there is no depth cue to sell it with. Worse, the height-animating panel
 * needs `overflow: hidden`, which silently forces `transform-style: flat` and
 * would flatten the entire case. The Vitrine lives here, below the case, a
 * sibling of the 3D chain and never an ancestor of it.
 */

function VolumeRow({ volume }: { volume: Volume }) {
  const { key, code, title, semester, guideId } = volume

  const face = (
    <>
      <span className={styles.code}>{code}</span>
      <span className={styles.title}>{title}</span>
      {/* Every cell is placed explicitly in the stylesheet, so the 26 volumes
          without a guide need no placeholder to hold the column open. */}
      {guideId ? <span className={styles.gilt} aria-hidden="true" /> : null}
      <span className={styles.semester}>{semester}</span>
    </>
  )

  return (
    <Vitrine
      id={vitrineId('vol', key)}
      group="coursework"
      kind="volume"
      className={styles.volume}
      faceClassName={styles.face}
      face={face}
    >
      <div className={styles.spread}>
        <div className={styles.verso}>
          {/* The headband the shelf draws at the head of these 13 spines, and
              the stripe the page legend shows. Decorative — the guide is a
              real named link on the recto. */}
          {guideId ? <span className={styles.versoHeadband} aria-hidden="true" /> : null}
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt className={styles.factLabel}>Code</dt>
              <dd className={`${styles.factValue} ${styles.mono}`}>{code}</dd>
            </div>
            <div className={styles.fact}>
              <dt className={styles.factLabel}>Semester</dt>
              <dd className={styles.factValue}>{semester}</dd>
            </div>
            <div className={styles.fact}>
              <dt className={styles.factLabel}>Department</dt>
              {/* The dye this volume is actually bound in. The page legend says
                  cloth colour is the department; this is the only place a
                  reader can check which is which without inferring it off the
                  shelf. Decorative — the department is right beside it as
                  text. */}
              <dd className={`${styles.factValue} ${styles.clothValue}`}>
                <span
                  className={styles.cloth}
                  style={{ background: volume.cloth }}
                  aria-hidden="true"
                />
                <span>{departmentName(code)}</span>
              </dd>
            </div>
          </dl>
        </div>

        <span className={styles.gutter} aria-hidden="true" />

        <div className={styles.recto}>
          <p className={styles.rectoTitle}>{title}</p>
          {guideId ? (
            <a
              className={styles.guide}
              href={guideUrl(guideId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Mastery guide
              <span className={styles.guideArrow} aria-hidden="true">
                &#8599;
              </span>
              <span className={styles.srOnly}>, opens in a new tab</span>
            </a>
          ) : null}
        </div>
      </div>
    </Vitrine>
  )
}

export default function Catalogue() {
  return (
    <section className={styles.catalogue} aria-labelledby="catalogue-heading">
      <div className={styles.inner}>
        <h2 className={styles.heading} id="catalogue-heading">
          Catalogue
        </h2>

        {SHELVES.map((shelf, shelfIndex) => {
          const yearId = `catalogue-year-${shelfIndex}`
          return (
            <section className={styles.year} key={shelf.label} aria-labelledby={yearId}>
              <h3 className={styles.yearLabel} id={yearId}>
                {shelf.label}
              </h3>
              {/*
                `role="list"` is load-bearing, not belt-and-braces: Safari
                strips list semantics from a <ul> carrying `list-style: none`,
                and the shelf list above needs it for the same reason.
              */}
              <ul className={styles.rows} role="list">
                {/* UGBA 196 is taken twice, so the key carries the semester. */}
                {shelf.volumes.map((volume) => (
                  <li key={volume.key}>
                    <VolumeRow volume={volume} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </section>
  )
}
