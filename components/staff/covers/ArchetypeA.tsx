import type { ArtProps } from './types'

/**
 * A — THE FIELD.
 *
 * One glyph, bottom-anchored, with roughly 62% of the sleeve left empty. The
 * emptiness is the design; filling it is how this archetype dies.
 *
 * AC-002 Restauranty ('86', the kitchen call for a dish that is gone) and
 * AC-006 Secure File Sharing ('∅').
 */
export function ArchetypeA({ ink, year, glyph }: ArtProps & { glyph: string }) {
  return (
    <>
      {/* Cover furniture, not content: 1.6cqw is 4.48px at the 280px jacket ceiling and
          2.88px at the 180px floor, under the 8px floor in spec 3 at every size.
          The year is real text at 10px in `.metaFile` under the shot. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '7.4%',
          textAlign: 'center',
          fontFamily: 'var(--salon-font-mono)',
          fontSize: '1.6cqw',
          letterSpacing: '.12em',
          color: ink,
          opacity: 0.8,
        }}
      >
        HIS {year} STUDIO PROJECT
      </div>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '6%',
          right: '6%',
          top: '8.9%',
          height: '1px',
          background: ink,
          opacity: 0.35,
        }}
      />
      {/* The glyph is a mark, not a word — it reads as '86' or 'empty set' to a
          screen reader either way, and the project's real name is in the meta
          line below the shot. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '6%',
          right: '6%',
          bottom: '5.4%',
          textAlign: 'center',
          fontFamily: 'var(--salon-font-grotesk)',
          fontWeight: 800,
          fontSize: '34cqw',
          lineHeight: 0.78,
          letterSpacing: '-.05em',
          color: ink,
        }}
      >
        {glyph}
      </div>
    </>
  )
}
