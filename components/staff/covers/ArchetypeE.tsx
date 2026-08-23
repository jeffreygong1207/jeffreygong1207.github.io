import type { ArtProps } from './types'

/**
 * E — THE MONOLITH.
 *
 * One form occupying 25-40% of the field, placed on the OPTICAL centre (47%,
 * not 50% — a form on the mathematical centre reads as sitting low).
 *
 * AC-008 BetterUp (light stock) and AC-010 Clearway Energy (dark stock). The
 * `translate(-50%,-50%)` here is 2D centring, the same as the disc label's; it
 * is not a pose. There is zero rotation anywhere in the crate.
 */
export function ArchetypeE({ h, accent, ink, deep, title, dark }: ArtProps & { dark: boolean }) {
  // The far end of the monolith's gradient. On dark stock it falls to near-black
  // so the form still separates from the ground; on light stock it can only fall
  // so far before it reads as a hole punched in the paper.
  const foot = dark ? `oklch(12% 0.02 ${h})` : `oklch(52% 0.05 ${h})`

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: '47%',
          transform: 'translate(-50%,-50%)',
          width: '31%',
          aspectRatio: '1 / 1.42',
          background: `linear-gradient(104deg, ${accent} 0%, ${deep} 62%, ${foot} 100%)`,
          boxShadow: `0 6cqw 9cqw -4cqw rgba(0,0,0,.5), inset 0 0 0 1px ${accent}`,
        }}
      />
      {/* The title AS PRINTED on the sleeve — 3.4cqw, which is 6.12px at the
          180px jacket floor. `.metaTitle` renders the same string as real text at
          19px directly below the shot, so leaving this exposed both broke the 8px
          floor in spec 3 and announced the title twice on the two `.plain` cards
          this archetype covers (AC-008, AC-010). */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '6%',
          textAlign: 'center',
          fontFamily: 'var(--salon-font-grotesk)',
          fontWeight: 600,
          fontSize: '3.4cqw',
          letterSpacing: '-.02em',
          color: ink,
        }}
      >
        {title}
      </div>
    </>
  )
}
