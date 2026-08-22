import { IdentityStrip } from './Label'
import type { ArtProps } from './types'

/**
 * B — THE PLATE.
 *
 * A 2:3 plate with a hard butt-edge, centred to exactly 50.00% (26.335% + half
 * of 47.33%). The off-by-a-pixel version of this is the tell, so the widths are
 * written to three decimals on purpose.
 *
 * AC-009 Impression — concentric circles pushed through the turbulence
 * displacement filter, because the tremor IS the subject of that project.
 * AC-011 NASA Techrise ORBS — radial horizon plus one ellipse.
 *
 * Draws its own identity strip: the plate's title block sits where the strip
 * would otherwise be measured from, so `Cover` skips the shared one here.
 */
export function ArchetypeB({
  h,
  accent,
  ink,
  deep,
  catalogue,
  title,
  plate,
}: ArtProps & { plate: 'impression' | 'horizon' }) {
  // 'Impression' -> 'impression'; 'NASA Techrise Challenge - ORBS' -> 'orbs'.
  const word = title.split(' ').pop()?.toLowerCase() ?? ''

  const inner =
    plate === 'impression' ? (
      <svg
        viewBox="0 0 200 300"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <g filter="url(#cr-warp)" fill="none" stroke={ink} strokeWidth="1.1" strokeLinecap="round">
          {[26, 40, 54, 68, 82, 96, 110].map((r) => (
            <circle key={r} cx="100" cy="150" r={r} />
          ))}
        </g>
      </svg>
    ) : (
      <>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(150% 58% at 50% 122%, ${accent} 0%, ${deep} 26%, oklch(12% 0.02 ${h}) 62%, oklch(8% 0.01 ${h}) 100%)`,
          }}
        />
        <svg
          viewBox="0 0 200 300"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <ellipse
            cx="100"
            cy="372"
            rx="176"
            ry="112"
            fill="none"
            stroke={accent}
            strokeWidth="1"
            opacity=".9"
          />
        </svg>
      </>
    )

  return (
    <>
      <IdentityStrip catalogue={catalogue} color={accent} />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '34.67%',
          width: '30.66%',
          top: '5.25%',
          height: '8.5%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          fontFamily: 'var(--salon-font-grotesk)',
          fontWeight: 700,
          fontSize: '6.4cqw',
          letterSpacing: '-.03em',
          color: ink,
        }}
      >
        {word}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '26.335%',
          width: '47.33%',
          top: '15.5%',
          height: '71%',
          overflow: 'hidden',
          background: deep,
        }}
      >
        {inner}
      </div>
      {/* Rule-and-space foot. Deterministic from the index, so server and client
          render byte-identical markup — Math.random() here would hydration-fail. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '39.5%',
          width: '21%',
          top: '88.75%',
          height: '6.3%',
          display: 'flex',
          gap: '1.5px',
          alignItems: 'stretch',
        }}
      >
        {Array.from({ length: 34 }, (_, i) => (
          <div
            key={i}
            style={{
              flex: ((i * 37) % 5) + 1,
              background: (i * 29) % 3 ? ink : 'transparent',
            }}
          />
        ))}
      </div>
    </>
  )
}
