import { hue } from '@/lib/projects'

/**
 * THE OKLCH RING — spec 2.3, ported verbatim from design/label.mjs.
 *
 * Lightness and chroma are FIXED on every function below; only hue moves. That
 * is the entire reason eleven covers read as one label rather than eleven
 * designs: every accent has identical perceptual weight, so no sleeve shouts
 * louder than its neighbour. Picking eleven colours by eye never does this.
 *
 * DO NOT vary the L or C numbers here. If a cover looks weak, change its
 * archetype, not its lightness.
 */

/** Cover ground. Two values only: one light stock, one dark stock. */
export const ground = (n: number, dark: boolean): string =>
  dark ? `oklch(18% 0.015 ${hue(n)})` : `oklch(96% 0.008 ${hue(n)})`

/** Ink value #1 of two: the accent. Carries the catalogue number on every cover. */
export const accent = (n: number): string => `oklch(78% 0.115 ${hue(n)})`

/** Ink value #2 of two, on a light cover. */
export const ink = (n: number): string => `oklch(20% 0.010 ${hue(n)})`

/** Ink value #2 of two, on a dark cover. */
export const inkOnDark = (n: number): string => `oklch(94% 0.010 ${hue(n)})`

/** Resolves the second ink for whichever stock this cover is printed on. */
export const inkFor = (n: number, dark: boolean): string => (dark ? inkOnDark(n) : ink(n))

/** The mid tone: plate grounds, monolith falloff, diagram fields. */
export const deep = (n: number): string => `oklch(30% 0.030 ${hue(n)})`

/** The colophon dot, bottom-right, 2.5% square. Barely-there by design. */
export const colophon = (n: number, dark: boolean): string =>
  dark ? `oklch(24% 0.018 ${hue(n)})` : `oklch(90% 0.012 ${hue(n)})`

/**
 * Translucent accent.
 *
 * design/label.mjs writes `${A}22` for archetype F's overlay, which concatenates
 * a two-digit hex alpha onto an `oklch(...)` string and produces invalid CSS —
 * the declaration is dropped and the overlay silently disappears. The correct
 * form is OKLCH's own slash-alpha; 0x22/255 = 0.13.
 */
export const accentAlpha = (n: number, alpha: number): string =>
  `oklch(78% 0.115 ${hue(n)} / ${alpha})`

/** Raw hue, for the one-off gradient stops that label.mjs interpolates inline. */
export { hue }
