import { accentAlpha } from './ring'
import type { ArtProps } from './types'

/**
 * F — THE MATERIAL.
 *
 * Full bleed off all four edges, no image and no form: a lit surface, and type
 * only in the identity strip. `feDiffuseLighting` over anisotropic turbulence
 * gives it a real direction (azimuth 235, elevation 34) matching the 104deg
 * laminate sweep on the jacket above it.
 *
 * AC-005 Posthuman.
 */
export function ArchetypeF({ n, deep }: ArtProps) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: deep }} />
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}
        aria-hidden="true"
      >
        <rect width="400" height="400" filter="url(#cr-material)" />
      </svg>
      {/* design/label.mjs writes `${A}22` here, which concatenates a hex alpha
          onto an oklch() string: invalid CSS, declaration dropped, overlay gone.
          accentAlpha() emits OKLCH slash-alpha instead. 0x22/255 = 0.13. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(104deg, ${accentAlpha(n, 0.13)} 0%, transparent 46%, #00000055 100%)`,
          mixBlendMode: 'overlay',
        }}
      />
    </>
  )
}
