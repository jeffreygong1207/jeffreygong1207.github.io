import { PROJECTS, catalogueNumber, projectLinks, type Project } from '@/lib/projects'
import { COVERS, Cover } from './covers'
import { accent, deep, ink } from './covers/ring'
import Vitrine, { vitrineId } from './Vitrine'
import VitrineEscape from './VitrineEscape'
import styles from './Crate.module.css'

/**
 * THE CRATE — spec 2.3. Eleven projects as vinyl packshots, each one a Vitrine
 * that opens in place: the disc slides out of the jacket and the panel below it
 * carries the description, the technologies and the way out to the project.
 *
 * Still a server component. The one client boundary on the surface is
 * `VitrineEscape`, which binds Escape-to-close and hands focus back to the face
 * it came from. It renders nothing and gates no visible state — every packshot
 * opens, closes and reveals its panel with the stylesheet alone, so a dead
 * bundle costs the keyboard shortcut and nothing else.
 *
 * The open state is the native `[open]` attribute and the travel is derived
 * from `--vitrine-open` in calc(). No keyframes for the slide, no measurement,
 * no ResizeObserver. The one @keyframes here is the 33 1/3 rpm rotation the
 * disc pays AFTER it lands, and it is gated on `prefers-reduced-motion`.
 *
 * Zero rotateY, zero perspective, no `transform-style: preserve-3d` anywhere in
 * this subtree — the disc's pose is a 2D translate plus a 2D rotate — so none of
 * the flattening hazards in spec 3 apply and the sleeve is free to use
 * `overflow: hidden` (which it must, for the artwork) and `isolation: isolate`
 * (which it must, to keep the blend modes local).
 */

/**
 * One `name` for all eleven, so the browser closes the open record when the
 * next one is asked for. Where the exclusive-accordion behaviour of `name` is
 * unsupported the group simply allows several open at once.
 */
const GROUP = 'crate'

export default function Crate() {
  return (
    <div className={styles.page}>
      <CrateFilters />
      <VitrineEscape group={GROUP} />

      {/* States what the page holds. It does not describe the label system that
          draws it — that rationale is spec 2.3 and belongs in the spec. */}
      <header className={styles.head}>
        <h1 className="salon-h1">The Crate</h1>
        <span className={styles.count}>{PROJECTS.length} projects</span>
      </header>

      <ul className={styles.crate}>
        {PROJECTS.map((project, index) => (
          <li key={project.title} className={styles.item}>
            <Packshot project={project} index={index} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The four shared SVG filters, declared ONCE for the whole page.
 *
 * Filter ids are document-global. Eleven cards each carrying their own
 * `<filter id="paper">` is invalid markup, and only the first one wins anyway —
 * so ten sleeves would silently reference a filter defined by a different card.
 * Every id here is `cr-` prefixed to stay clear of the layout's `#salon-grain`.
 *
 * `colorInterpolationFilters="sRGB"` on all four is not decoration: SVG's
 * default is linearRGB, which returns turbulence roughly 47% brighter than
 * these baseFrequency and opacity values were tuned against.
 */
function CrateFilters() {
  return (
    <svg className={styles.defs} aria-hidden="true" focusable="false">
      <defs>
        {/* Jacket board grain. */}
        <filter id="cr-paper" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
            result="n"
          />
          <feColorMatrix in="n" type="saturate" values="0" />
        </filter>

        {/* Printed stock of the cover artwork itself. Finer and far lighter. */}
        <filter id="cr-stock" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.80"
            numOctaves="3"
            stitchTiles="stitch"
            result="n"
          />
          <feColorMatrix in="n" type="saturate" values="0" />
        </filter>

        {/* Archetype B / Impression: the tremor in the concentric circles. */}
        <filter id="cr-warp" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.013"
            numOctaves="4"
            seed="19"
            result="t"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="t"
            scale="34"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Archetype F: a lit surface. Azimuth 235 matches the 104deg laminate
            sweep on the jacket, so the two lights agree. */}
        <filter id="cr-material" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.30 0.055"
            numOctaves="2"
            seed="11"
            result="w"
          />
          <feColorMatrix in="w" type="saturate" values="0" result="m" />
          <feDiffuseLighting in="m" lightingColor="white" surfaceScale="9">
            <feDistantLight azimuth="235" elevation="34" />
          </feDiffuseLighting>
        </filter>
      </defs>
    </svg>
  )
}

function Packshot({ project, index }: { project: Project; index: number }) {
  const spec = COVERS[index]
  const catalogue = catalogueNumber(index)
  const { primary, secondary } = projectLinks(project)
  // Both destinations now live in the panel, so the split that kept the second
  // one out of the packshot anchor collapses back into one list. Five of eleven
  // have anything here at all; the rest render no list and no placeholder.
  const links = primary ? [primary, ...secondary] : []

  /**
   * THE FACE — the object. Everything inside it is decorative and aria-hidden
   * except the meta line, which is where the accessible name of the record
   * lives. No interactive element may appear here: a link inside a <summary>
   * is invalid and unreachable, which is why the destinations are in the panel.
   */
  const face = (
    <>
      <div className={styles.stage}>
        <div className={styles.shadow} aria-hidden="true" />

        {/* Disc: 0.9596 of the jacket, top 0.0202, and at rest slid right by
            exactly one radius, BEHIND the sleeve. Better than half of it is
            occluded, which is the point — the occlusion is the depth cue.
            Three layers, and the split between them is what makes it read as a
            record rather than as a photograph of one:

              .disc     the pose. Carries the travel, the tilt and the two
                        shadow lobes, so the shadows travel with the object.
              .platter  the grooves, the base and the label. Spins inside the
                        pose once the record has landed.
              .sheen    the key light. Counter-transformed back into page
                        space, so rotating the disc does NOT move the highlight
                        and translating the disc DOES sweep it across the face.
                        Anisotropic and rotationally symmetric, like real vinyl.
        */}
        <div className={styles.disc} aria-hidden="true">
          <div className={styles.platter}>
            <div
              className={styles.label}
              style={{
                // Held on the accent for the first 42% so the L20 ink stays legible
                // right across the visible face, then dropping to deep past the rim.
                background: `radial-gradient(circle at 42% 34%, ${accent(index)} 0%, ${accent(index)} 42%, ${deep(index)} 118%)`,
              }}
            >
              {/* The catalogue number, not the project name: a label face is
                  90px across here and 'NASA Techrise Challenge - ORBS' is 30
                  characters. Clipped type is a cheap-render tell, and a real
                  label carries its catalogue number anyway. */}
              <span className={styles.labelTitle} style={{ color: ink(index) }}>
                {catalogue}
              </span>
              <span className={styles.hole} />
              <span className={styles.labelSide} style={{ color: ink(index), opacity: 0.72 }}>
                SIDE A · {spec.year}
              </span>
            </div>
          </div>

          <div className={styles.sheen}>
            <div className={styles.sheenLight} />
          </div>
        </div>

        <div className={styles.sleeve}>
          <Cover project={project} index={index} />
          <div className={styles.ring} aria-hidden="true" />
          <div className={styles.seam} aria-hidden="true" />
          <svg
            className={styles.grain}
            viewBox="0 0 400 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect width="400" height="400" filter="url(#cr-paper)" />
          </svg>
          <div className={styles.lam} aria-hidden="true" />
        </div>
      </div>

      {/* Flat HTML, and the only accessible content of the object. The title is
          real text at 19px and the catalogue number real text at 10px; every
          text node inside .stage above is aria-hidden, because all of the
          sleeve and disc type falls under spec 3's 8px floor somewhere in this
          jacket's 180-280px range. Anything a cover needs to say gets said
          here instead. */}
      <div className={styles.meta}>
        <span className={styles.metaTitle}>{project.title}</span>
        <span className={styles.metaFile}>
          {catalogue} · {spec.year}
        </span>
      </div>
    </>
  )

  return (
    <article className={styles.shot}>
      <Vitrine
        id={vitrineId('rec', project.title)}
        group={GROUP}
        kind="record"
        className={styles.record}
        faceClassName={styles.face}
        face={face}
      >
        <div className={styles.detail}>
          <p className={styles.note}>{project.description}</p>

          {project.technologies.length > 0 ? (
            <ul className={styles.tech}>
              {project.technologies.map((tech) => (
                <li key={tech} className={styles.techItem}>
                  {tech}
                </li>
              ))}
            </ul>
          ) : null}

          {links.length > 0 ? (
            <ul className={styles.outbound}>
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    className={styles.out}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    // The visible label is two words and there are eleven cards,
                    // so the accessible name carries the record it belongs to.
                    // It contains the visible string verbatim (SC 2.5.3).
                    aria-label={`${project.title} — ${link.label} (opens in a new tab)`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Vitrine>
    </article>
  )
}
