import type { ArtProps } from './types'

/**
 * C — THE SPECIMEN.
 *
 * Display type cropped by the trim, with the WIDTH AXIS doing all the contrast:
 * line 1 at `font-stretch: 78%`, line 2 at `112%`. Same family, same weight,
 * same size — only the wdth axis moves. That is the whole cover.
 *
 * THIS REQUIRES VARIABLE ARCHIVO. The staff layout declares it with
 * `axes: ['wdth']` (62..125), so both stretches are inside the axis range. A
 * static Archivo renders the two lines identically, the cover quietly loses its
 * only idea, and NOTHING errors — so if this ever looks flat, check the font
 * declaration before touching anything here.
 *
 * AC-003 TickerMaster.
 */
export function ArchetypeC({ ink, l1, l2, tech }: ArtProps & { l1: string; l2: string; tech: string }) {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '5%',
          top: '26%',
          fontFamily: 'var(--salon-font-grotesk)',
          fontWeight: 900,
          fontSize: '19.4cqw',
          lineHeight: 0.9,
          letterSpacing: '-.035em',
          color: ink,
          fontStretch: '78%',
        }}
      >
        {l1}
        <br />
        <span style={{ fontStretch: '112%' }}>{l2}</span>
      </div>
      {/* Empty for a project with no technologies listed — Secure File Sharing
          System is the real case — rather than a line of stray separators.

          aria-hidden for the same reason as the display type above it: 1.5cqw
          is 4.2px at the 280px jacket ceiling, which is printed foot matter
          rather than readable UI, and spec 3 puts the floor at 8px. The full
          technology list lives on the public /projects route; the crate's
          accessible content is the title and catalogue number in the flat meta
          line below the shot. */}
      {tech ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '6%',
            bottom: '6%',
            fontFamily: 'var(--salon-font-mono)',
            fontSize: '1.5cqw',
            letterSpacing: '.14em',
            color: ink,
            opacity: 0.75,
          }}
        >
          {tech}
        </div>
      ) : null}
    </>
  )
}
