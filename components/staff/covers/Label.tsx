/**
 * THE FROZEN LABEL LAYER — spec 2.3. On every cover, no exceptions.
 *
 * 6% margin all sides · an identity strip carrying ONLY the catalogue number ·
 * two typefaces · two ink values · one grain · a colophon dot bottom-right.
 * Nothing in this file is per-project. If a cover wants a different strip, the
 * answer is no — that is what makes eleven covers one label.
 */

/**
 * The catalogue number, top-left. This is the only thing visible when a sleeve
 * is racked in a crate, so it is printed on every cover, never omitted.
 *
 * Archetypes B and D lay out around the strip and therefore render it inside
 * their own markup. `Cover` skips it for those two — do not double it.
 *
 * aria-hidden, and the exemption in spec 3 is why that is the right call rather
 * than a dodge. 1.6cqw is 4.48px at the 280px jacket ceiling, so this is a
 * decorative spine code — and the spec's condition on that exemption is that it
 * "must also exist as accessible text", which `.metaFile` satisfies: it carries
 * the same `AC-0NN` string at 10px in --salon-muted under every shot. The
 * accent-on-light-stock pairing here is around 1.7:1, which is a print value,
 * not a UI one, and is the other half of why this cannot be the real copy.
 *
 * z-index 3 is load-bearing, not tidying. `Cover` paints the strip before the
 * archetype, so a full-bleed archetype — F is the live case, and B's plate is
 * one bad measurement away from being another — buries it under artwork with
 * nothing to show for it. That silently costs the catalogue number, which is
 * the one thing that must survive on every cover. Everything the sleeve itself
 * adds (stock grain 4, ring 6, seam 7, laminate 8, board grain 9) still passes
 * over the top, so the strip reads as printed on the cover, not stuck to it.
 */
export function IdentityStrip({ catalogue, color }: { catalogue: string; color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '6%',
        top: '5.6%',
        zIndex: 3,
        fontFamily: 'var(--salon-font-mono)',
        fontSize: '1.6cqw',
        letterSpacing: '.12em',
        color,
      }}
    >
      {catalogue}
    </div>
  )
}

/** The colophon dot, bottom-right. Purely a mark of the imprint. */
export function Colophon({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: '6%',
        bottom: '5.4%',
        // Same reason as the strip: it is part of the frozen layer, so a
        // full-bleed archetype must not be able to paint it out.
        zIndex: 3,
        width: '2.5%',
        height: '2.5%',
        borderRadius: '50%',
        background: color,
      }}
    />
  )
}
