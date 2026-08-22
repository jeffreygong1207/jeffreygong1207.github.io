import styles from './Sheet.module.css'

/**
 * The reading and writing surface (spec 2.5).
 *
 * `Sheet.Surface` is the outer frame: it publishes the paper custom properties
 * that both the sheet and any chrome beside it read, and it is deliberately NOT
 * `.salon-sheet`, so it does not claim the measure.
 *
 * `Sheet` is the measure itself — 592px, roughly 66 characters, Newsreader at
 * 18.5px on 1.66. It carries `.salon-sheet`, which is what globals.css watches
 * with `:has()` to take the whole room light over 500ms. That is the entire
 * transition: a cross-fade of the ground, not a hard cut and not a gradient,
 * and never a floating light card with a radius and a shadow on the dark
 * ground — a large light rectangle on a dark ground is a glare bomb at night.
 *
 * Nothing here is 3D. No transform, no perspective, no `preserve-3d`, and no
 * per-surface grain: the staff area has exactly one screen-space grain overlay
 * and it lives in the admin layout.
 */
export default function Sheet({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`salon-sheet ${styles.sheet}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}

export function SheetSurface({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`${styles.surface}${className ? ` ${className}` : ''}`}>{children}</div>
  )
}
