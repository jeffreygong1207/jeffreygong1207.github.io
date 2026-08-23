/**
 * Cover specs and the shared prop bag every archetype receives.
 *
 * The archetype is a presentation choice, not project data, so it lives here
 * rather than in lib/projects.ts. The array in ./index.tsx is index-aligned with
 * `PROJECTS`, which is what maps AC-001..AC-011 onto the ring.
 */

export type Archetype = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

interface CoverBase {
  /** Which stock the cover is printed on. Picks ground and the second ink. */
  dark: boolean
  year: number
}

export type CoverSpec =
  | (CoverBase & { archetype: 'A'; glyph: string })
  | (CoverBase & { archetype: 'B'; plate: 'impression' | 'horizon' })
  | (CoverBase & { archetype: 'C'; l1: string; l2: string })
  | (CoverBase & { archetype: 'D'; plot: 'trail' | 'grid' })
  | (CoverBase & { archetype: 'E' })
  | (CoverBase & { archetype: 'F' })
  | (CoverBase & { archetype: 'G'; lines: string[] })

/**
 * What each archetype gets. `accent` and `ink` are the frozen label system's
 * TWO ink values — an archetype may not introduce a third.
 *
 * Every length in an archetype is a percentage of the sleeve or a `cqw`, which
 * resolves against `container-type: inline-size` on the sleeve element. Without
 * that declaration every `cqw` below computes to zero and the cover renders
 * blank. See Crate.module.css.
 */
export interface ArtProps {
  /** Ring index, 0-based, same index as the project in PROJECTS. */
  n: number
  /** Hue string for the one-off gradient stops that interpolate it inline. */
  h: string
  accent: string
  ink: string
  deep: string
  catalogue: string
  title: string
  year: number
}
