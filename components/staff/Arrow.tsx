/**
 * A drawn arrow, because the typeset one is not in the font.
 *
 * next/font/google self-hosts Karla's latin subset, and that subset's
 * unicode-range covers U+2191 and U+2193 but NOT U+2190 or U+2192 — vertical
 * arrows in, horizontal arrows out. Verified against the shipped @font-face
 * rules, not assumed. So every `&rarr;` and `&larr;` on the staff side was
 * rendering in whatever system sans the platform picked: a different typeface
 * at a different weight with different metrics, sitting inline with Karla.
 *
 * Sized in `em` and stroked in `currentColor`, so it inherits the size, colour
 * and hover transition of whatever it sits beside without being told about any
 * of them. `aria-hidden` throughout: every use is beside the words it points
 * at, so it carries no meaning of its own — and the accessible name of the
 * link must not gain a stray "arrow".
 *
 * The baseline nudge is the same trick a text glyph gets for free: an inline
 * SVG sits on the baseline by default, which leaves it riding high against
 * lowercase text. -0.08em drops it onto the visual centre of the x-height.
 */
export default function Arrow({
  direction = 'right',
  className,
}: {
  direction?: 'right' | 'left'
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: '-0.08em',
        flex: 'none',
        transform: direction === 'left' ? 'scaleX(-1)' : undefined,
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 8h10M8.75 4.25 12.5 8l-3.75 3.75" />
    </svg>
  )
}
