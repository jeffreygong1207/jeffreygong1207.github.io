import { SHELVES, type Volume } from '@/lib/coursework'
import { vitrineId } from './Vitrine'
import styles from './Bookcase.module.css'

/**
 * The bookcase — spec §2.2, ported from design/shelf.mjs. 39 course volumes on
 * four shelves, one per academic year, pure CSS 3D. No WebGL, no canvas, no
 * dependency. Every numeric constant in the generator is preserved except where
 * the DEVIATIONS block below says otherwise, and says why.
 *
 * Deliberately a server component. The geometry is static, there is no pointer
 * parallax and no autonomous drift, so there is nothing to gate on
 * components/staff/useReducedMotion.ts — the only motion is the hover/focus
 * response on the spines, which is a CSS transition sized off --salon-lift and
 * is already handled by the shared `prefers-reduced-motion` block in
 * globals.css.
 *
 * NOTHING OPENS ON THE SHELF. No panel is rendered here and --vitrine-open is
 * not read anywhere in this file. A spine is a pointer: it carries one anchor
 * to its own entry in the catalogue below the case, which is where a volume
 * opens. A height-animating panel needs `overflow: hidden`, and overflow
 * silently forces `transform-style: flat` — putting one anywhere inside the
 * case would flatten the whole thing, which this project has already paid for
 * once.
 *
 * The foil title is DECORATIVE, at the same status the course code has always
 * held: it is set at the angular size 5mm spine type really has at reading
 * distance, which is a recognition cue and not a reading surface. Nothing on
 * the page asks anyone to read it, and the full string is live text both in
 * .srOnly here and in the catalogue. That is why the clamp below is not the
 * lever for legibility and is not touched.
 *
 * There is no grain overlay here. The staff layout ships the single
 * screen-space one for the whole area (rule 16); per-object grain rasterises at
 * pre-transform size and blurs when the 3D transform scales it.
 *
 * ---------------------------------------------------------------------------
 * DEVIATIONS FROM design/shelf.mjs — signed off, not incidental.
 * ---------------------------------------------------------------------------
 * §2.2 says to preserve every numeric constant in the generator. These are the
 * three places where the generator contradicts the spec's own rule text, and
 * the rule text wins. Every constant is kept; what changes is how it is used.
 *
 *   1. TRACKING DIRECTION. shelf.mjs emits
 *          letter-spacing: fs < 7 ? .09em : fs < 9 ? .12em : .15em
 *      which hands the SMALLEST type the TIGHTEST tracking. Rule 4 states the
 *      opposite — "Tracking RISES as size falls (.09em -> .15em)" — and names
 *      that inverse relationship a quality signal. Same three values, mapping
 *      flipped. See trackEm.
 *   2. TITLE ADVANCE. shelf.mjs models Cinzel at 0.58 and then sets tracking
 *      on top without adding it back, so its own preview overflows 29 of the
 *      39 spines. See CINZEL_ADVANCE.
 *   3. CODE SIZE. shelf.mjs's cap*0.5/0.7 is half the title's MAXIMUM size, so
 *      it inverts rule 1 the moment the auto-fit pulls the title down. See
 *      codeFs.
 *
 * Consequence, stated plainly rather than buried in a comment further down:
 * 1 and 2 together mean 27 of the 39 spines are actually reduced by the fit,
 * i.e. carry a font-size shelf.mjs would not have emitted. That is the price of
 * rule 4's "never overflow", which the same rule states as a requirement. The
 * other 12 are not shrunk at all; 8 of those match shelf.mjs's emitted tenth
 * exactly and 4 sit up to 0.05px below it, because sizes are quantised DOWN
 * (floor1) where shelf.mjs rounds. Measured over all 39: 0 overflow and 0
 * clipped glyphs, tightest slack 0.006px against the 0.66 advance this file
 * models with, and 5.9px (UGBA 102B) laid out by the browser with Cinzel 600
 * actually loaded — the gap between the two is the safety margin 0.66 buys over
 * Cinzel's measured ~0.639.
 *
 * Everything else — widths, heights, the 16-stop cylinder profile, hinge
 * geometry, bevel, seam, weave, dye-lot drift, foil ramp, headband and the four
 * leans — is transcribed from the generator unchanged.
 */

/** Formatting matches shelf.mjs's own rounding so the output is identical. */
const px1 = (n: number) => `${n.toFixed(1)}px`
const px0 = (n: number) => `${n.toFixed(0)}px`

/**
 * Tracking by size — shelf.mjs's three steps, in the direction rule 4 states:
 * tracking RISES as the size falls. Deviation 1 in the header.
 */
const trackEm = (size: number) => (size < 7 ? 0.15 : size < 9 ? 0.12 : 0.09)

/**
 * The same three steps as intervals, for the fit below. `hi` is the largest
 * TENTH still inside each band, because every candidate size is quantised to a
 * tenth; both `lo` values are exact tenths, so quantising can never drop a
 * candidate out of the band it was solved for.
 */
const TRACK_BANDS = [
  { lo: 4.6, hi: 6.9, track: 0.15 },
  { lo: 7.0, hi: 8.9, track: 0.12 },
  { lo: 9.0, hi: Number.POSITIVE_INFINITY, track: 0.09 },
] as const

/** Down to a tenth, never up. Rounding up can only add run to the title. */
const floor1 = (n: number) => Math.floor(n * 10) / 10

/**
 * Cinzel's real advance, as a fraction of font-size and EXCLUDING tracking.
 * shelf.mjs models this as 0.58 and then sets letter-spacing on top without
 * adding it back, so its own preview spills the foil off the foot of the spine.
 * Measured across all 39 strings at their rendered sizes the true figure lands
 * between 0.569 and 0.639; 0.66 bounds it. Rule 4's actual requirement is
 * "never overflow", so the correction stays — and the second fitting pass below
 * keeps shelf.mjs's size untouched on every spine where it already fits.
 */
const CINZEL_ADVANCE = 0.66

/** IBM Plex Mono is monospaced at exactly 0.6em, plus the 0.18em tracking. */
const MONO_ADVANCE = 0.6 + 0.18

function spineVars(volume: Volume): React.CSSProperties {
  const { width: w, height: h, code, shortTitle, cloth, lean, dyeIndex, guideId } = volume

  /*
    Rule 2. Cap height is 25–40% of spine width but CLAMPED at 13.5px, not
    scaled linearly: past ~15mm real spines stop growing the type and spend the
    extra width on margin. Scaling type linearly with spine width is the #1 CG
    tell.
  */
  const cap = Math.min(w * 0.3, 13.5)

  // Everything on the spine that is not the title, measured down its length.
  const padTop = h * 0.068
  const padBottom = h * 0.04
  const ruleTopH = Math.max(1, w * 0.022)
  const ruleBottomH = Math.max(1, w * 0.02)
  const titleMt = h * 0.018
  const codeMt = h * 0.016

  /*
    Rule 4, first pass — shelf.mjs verbatim. `run` is the vertical space the
    title may occupy, 0.58 its advance estimate, 4.6px the floor. That floor is
    what forces the short spine titles: the real catalogue titles run to 61
    characters ("Designing, Visualizing and Understanding Deep Neural
    Networks") and drive this to 3.3px, under the floor and off the spine.
  */
  const len = shortTitle.length
  const fitted = (h * 0.55) / (len * 0.58)
  const fsRef = Math.max(4.6, Math.min(cap / 0.7, fitted))

  /*
    Rule 1. The course code is the SMALLEST element on the spine. shelf.mjs
    sizes it at cap*0.5/0.7 — half the title's MAXIMUM size — which is correct
    only while the title is at that maximum. Once the auto-fit pulls the title
    down the code overtakes it, and with real Berkeley codes ("COMPSCI 61A", not
    "CS 61A") it eats 80px of a 208px spine. Half the title's ACTUAL size keeps
    shelf.mjs's ratio and keeps rule 1 true at every size.
  */
  const codeRun = code.length * Math.min((cap * 0.5) / 0.7, fsRef * 0.5) * MONO_ADVANCE

  /*
    Rule 4, second pass: never overflow.

      run(size) = len * size * (CINZEL_ADVANCE + trackEm(size))

    run is NOT monotonic in size. Tracking rises as the size falls, so shrinking
    across a band boundary makes the per-glyph advance jump UP — a proportional
    shrink (fsRef * budget / needed) can land on a size that needs MORE room
    than the one it was derived from. Solve each band in closed form instead and
    keep the largest size any band admits: inside a band the tracking is a
    constant, so

      run <= budget  <=>  size <= budget / (len * (CINZEL_ADVANCE + track))

    and clamping that to the band gives its exact optimum. The maximum over the
    three bands is the fixed point, reached without iterating, and it agrees
    with trackEm by construction. Quantising DOWN to a tenth only ever adds
    slack. A title that already fits keeps shelf.mjs's size.
  */
  const budget = h - padTop - padBottom - ruleTopH - ruleBottomH - titleMt - codeMt - codeRun
  let fs = 0
  for (const band of TRACK_BANDS) {
    const solved = budget / (len * (CINZEL_ADVANCE + band.track))
    const candidate = floor1(Math.min(fsRef, band.hi, solved))
    if (candidate >= band.lo && candidate > fs) fs = candidate
  }
  /*
    No band admits a fitting size — hold rule 4's own 4.6px floor and let
    .type's overflow guard take the tail, because foil lying across the shelf
    board is worse than a clipped word and the full title is in .srOnly either
    way. Unreachable on today's data: all 39 fit, the tightest (COMPSCI 182) by
    0.01px against this model and by ~1.5px against Cinzel's measured advance.
  */
  if (fs === 0) fs = 4.6

  const codeFs = Math.min((cap * 0.5) / 0.7, fs * 0.5)
  const track = `${trackEm(fs)}em`

  /*
    Rule 12. Foil is a gradient that goes near-black at both ends, never a flat
    fill. Gilt is the real gold; the other 26 are a blind-stamped pale grey that
    reads as debossed cloth rather than as a link that does not work.
  */
  const gilt = guideId !== null
  const foilTop = gilt ? '#F2DC9E' : 'rgba(245,240,230,0.80)'
  const foil = gilt ? '#D9B45F' : 'rgba(238,232,220,0.62)'
  const foilLow = gilt ? '#6B5324' : 'rgba(150,146,138,0.34)'

  // Rule 11. Dye lot: hue ±5°, brightness ±8%, weave phase decorrelated per book.
  const drift = ((dyeIndex * 53) % 11) - 5
  const val = 1 + (((dyeIndex * 29) % 9) - 4) * 0.02
  const phase = (dyeIndex * 37) % 11

  return {
    '--w': `${w}px`,
    '--h': `${h}px`,
    '--lean': `${lean}deg`,
    '--cloth': cloth,
    '--drift': `${drift}deg`,
    '--val': val.toFixed(3),
    '--phase': `${phase}px`,
    '--ao-y': px0(h * 0.04),
    '--ao-blur': px0(h * 0.05),
    '--ao-spread': px0(h * 0.02),
    '--hinge-in': px1(w * 0.085),
    '--hinge-w': px1(Math.max(1.5, w * 0.045)),
    '--headband-in': px1(w * 0.1),
    '--headband-w': px1(w * 0.8),
    '--pad-top': px1(padTop),
    '--pad-bottom': px1(padBottom),
    // Foil never reaches the hinge groove.
    '--rule-w': px1(w * 0.72),
    '--rule-h-top': px1(ruleTopH),
    '--rule-h-bottom': px1(ruleBottomH),
    '--title-mt': px1(titleMt),
    '--code-mt': px1(codeMt),
    '--fs': px1(fs),
    '--code-fs': px1(codeFs),
    '--track': track,
    '--foil': foil,
    '--foil-grad': `linear-gradient(96deg, ${foilLow} 0%, ${foil} 26%, ${foilTop} 46%, ${foil} 62%, ${foilLow} 100%)`,
  } as React.CSSProperties
}

function Spine({ volume }: { volume: Volume }) {
  const { code, title, shortTitle, guideId } = volume

  /*
    The gilt headband used to be selected off `.guideLink`, which only the 13
    existed to carry. That anchor is gone — every volume now carries the same
    one — so the distinction moves onto a modifier driven by the SAME `guideId`
    that decides the foil in spineVars. One source of truth, as before; the
    headband still cannot disagree with the title it sits above.
  */
  const className = guideId === null ? styles.spine : `${styles.spine} ${styles.gilt}`

  return (
    <li className={className} style={spineVars(volume)}>
      <span className={styles.cloth} />
      <span className={styles.hingeLeft} />
      <span className={styles.hingeRight} />
      <span className={styles.seamShade} />
      <span className={styles.seamSliver} />
      <span className={styles.headband} />

      <span className={styles.type}>
        <span className={styles.ruleTop} />
        {/* Decorative: too small and too abbreviated to be the accessible text.
            The real thing is in .srOnly below. */}
        <span className={styles.titleFoil} aria-hidden="true">
          {shortTitle}
        </span>
        <span className={styles.spacer} />
        <span className={styles.ruleBottom} />
        <span className={styles.codeFoil} aria-hidden="true">
          {code}
        </span>
      </span>

      {/*
        One anchor per volume, covering the whole spine, on ALL 39 — not on the
        13 that happen to hold a PDF. It targets the volume's own entry in the
        catalogue below the case: the fragment lands inside a closed <details>,
        and the HTML "ancestor details revealing" algorithm expands it, so the
        entry opens with no script running at all.

        The accessible name is real text rather than an aria-label, so it
        survives translation, and it stays the full catalogue title — the foil
        above it is an abbreviation set below reading size and is decorative,
        exactly as the code beside it already was.
      */}
      <a className={styles.spineLink} href={`#${vitrineId('vol', volume.key)}`}>
        <span className={styles.srOnly}>
          {code} &mdash; {title}
        </span>
      </a>
    </li>
  )
}

export default function Bookcase() {
  return (
    <div className={styles.viewport}>
      <div className={styles.stage}>
        <div className={styles.case}>
          <span className={styles.edgeLeft} aria-hidden="true" />
          <span className={styles.edgeRight} aria-hidden="true" />
          <span className={styles.edgeTop} aria-hidden="true" />

          <div className={styles.shelves}>
            {SHELVES.map((shelf, shelfIndex) => {
              // The caption is the shelf's visible label, so name the list FROM
              // it rather than authoring the same string twice: one announcement
              // instead of two, and the accessible name matches the visible text
              // for voice control.
              const captionId = `bookcase-shelf-${shelfIndex}`
              return (
                <div className={styles.shelf} key={shelf.label}>
                  {/*
                    `role="list"` is load-bearing, not belt-and-braces: Safari
                    strips list semantics from a <ul> with `list-style: none`,
                    which would also drop the accessible name (an aria-labelledby
                    on an element with no role is not exposed) and take the shelf
                    label with it.
                  */}
                  <ul
                    className={styles.row}
                    role="list"
                    style={{ height: `${shelf.maxHeight + 12}px` }}
                    aria-labelledby={captionId}
                  >
                    {/* UGBA 196 is taken twice, so the key carries the semester. */}
                    {shelf.volumes.map((volume) => (
                      <Spine key={volume.key} volume={volume} />
                    ))}
                  </ul>
                  <div className={styles.board} aria-hidden="true" />
                  <p className={styles.caption} id={captionId}>
                    {shelf.label} &middot; {shelf.volumes.length} VOLUMES
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
