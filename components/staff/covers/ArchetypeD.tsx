import { IdentityStrip } from './Label'
import type { ArtProps } from './types'

/**
 * D — THE DIAGRAM.
 *
 * Real project shape, no type at all on the front. The catalogue strip is the
 * only text, which is why this archetype draws it itself — `Cover` skips the
 * shared one here.
 *
 * AC-004 AI-SL — a motion trail, six decaying strokes from one origin point.
 * AC-007 BerkeleyTime — an enrolment grid; the schedule IS the artwork.
 */
export function ArchetypeD({
  accent,
  ink,
  catalogue,
  plot,
}: ArtProps & { plot: 'trail' | 'grid' }) {
  const body =
    plot === 'grid' ? (
      <>
        <g fill={accent}>
          {(
            [
              [42, 58, 64, 52],
              [110, 114, 64, 108],
              [246, 58, 64, 52],
              [178, 226, 64, 52],
              [314, 170, 64, 108],
            ] as const
          ).map(([x, y, w, hh]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={w} height={hh} />
          ))}
        </g>
        <g stroke={ink} strokeWidth="1" opacity=".35">
          {[40, 108, 176, 244, 312].map((x) => (
            <path key={`v${x}`} d={`M${x} 40V340`} />
          ))}
          {[56, 112, 168, 224, 280].map((y) => (
            <path key={`h${y}`} d={`M40 ${y}H340`} />
          ))}
        </g>
      </>
    ) : (
      <>
        <g fill="none" stroke={ink} strokeLinecap="round">
          {(
            [
              [3, 0.95],
              [2.4, 0.66],
              [2, 0.46],
              [1.6, 0.3],
              [1.3, 0.18],
              [1.1, 0.1],
            ] as const
          ).map(([w, o], i) => (
            <path
              key={w}
              d={`M46 336 C${86 + i * 10} ${196 + i * 16} ${186 + i * 14} ${118 + i * 20} ${340 + i * 8} ${128 + i * 24}`}
              strokeWidth={w}
              opacity={o}
            />
          ))}
        </g>
        <circle cx="46" cy="336" r="6" fill={ink} />
      </>
    )

  return (
    <>
      <IdentityStrip catalogue={catalogue} color={accent} />
      <svg
        viewBox="0 0 380 380"
        style={{ position: 'absolute', left: '19%', top: '22%', width: '62%', height: '56%' }}
        aria-hidden="true"
      >
        {body}
      </svg>
    </>
  )
}
