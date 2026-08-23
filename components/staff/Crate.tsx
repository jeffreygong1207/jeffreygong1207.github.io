import { PROJECTS, catalogueNumber, projectLinks, type Project } from '@/lib/projects'
import { COVERS, Cover } from './covers'
import { accent, deep, ink } from './covers/ring'
import styles from './Crate.module.css'

/**
 * THE CRATE — spec 2.3. Eleven projects as vinyl packshots.
 *
 * A server component on purpose: there is no motion here to gate, so there is
 * no client bundle, no hydration, and every interactive object is a real anchor
 * in the server-rendered HTML. `useReducedMotion` is for autonomous motion;
 * the only movement in this surface is a hover colour and shadow change, which
 * the shared `prefers-reduced-motion` block in globals.css already flattens.
 *
 * Zero rotation, zero perspective, no `transform-style: preserve-3d` anywhere
 * in this subtree — so none of the flattening hazards in spec 3 apply and the
 * sleeve is free to use `overflow: hidden` (which it must, for the artwork) and
 * `isolation: isolate` (which it must, to keep the blend modes local).
 */
export default function Crate() {
  return (
    <div className={styles.page}>
      <CrateFilters />

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

  const shot = (
    <>
      <div className={styles.stage}>
        <div className={styles.shadow} aria-hidden="true" />

        {/* Disc: 0.9596 of the jacket, top 0.0202, slid right by exactly one
            radius, BEHIND the sleeve. Better than half of it is occluded, which
            is the point — the occlusion is the depth cue. Decorative: every
            word of it is repeated as real text in the meta line below. */}
        <div className={styles.disc} aria-hidden="true">
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
      {primary ? (
        <a
          className={styles.link}
          href={primary.href}
          target="_blank"
          rel="noopener noreferrer"
          // The sleeve is covered in artwork type, so the link is named
          // explicitly rather than by concatenating everything inside it.
          aria-label={`${project.title} — ${primary.label} (opens in a new tab)`}
        >
          {shot}
        </a>
      ) : (
        // Six of eleven have no links. Not an anchor, not focusable, no hover
        // response — nothing about it suggests it can be activated. These are
        // also the six cards with no aria-label, which is why every text node
        // inside .stage has to be aria-hidden: whatever a cover prints would
        // otherwise be read out verbatim here at 4-6px on screen.
        <div className={styles.plain}>{shot}</div>
      )}

      {secondary.length > 0 ? (
        <ul className={styles.extras}>
          {secondary.map((link) => (
            <li key={link.href}>
              <a
                className={styles.extra}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} — ${link.label} (opens in a new tab)`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
