import { catalogueNumber, hue, techLine, type Catalogue, type Project } from '@/lib/projects'
import { ArchetypeA } from './ArchetypeA'
import { ArchetypeB } from './ArchetypeB'
import { ArchetypeC } from './ArchetypeC'
import { ArchetypeD } from './ArchetypeD'
import { ArchetypeE } from './ArchetypeE'
import { ArchetypeF } from './ArchetypeF'
import { ArchetypeG } from './ArchetypeG'
import { Colophon, IdentityStrip } from './Label'
import { accent, colophon, deep, ground, inkFor } from './ring'
import type { ArtProps, CoverSpec } from './types'

export type { Archetype, ArtProps, CoverSpec } from './types'

/**
 * Cover specs, INDEX-ALIGNED with `PROJECTS` in lib/projects.ts. Position n in
 * this array is catalogue AC-00(n+1) and hue 24 + (360/11)*n. Reorder one array
 * without the other and every cover gets the wrong artwork and the wrong hue.
 *
 * `Catalogue<T>` is the same fixed-length tuple `PROJECTS` is typed as, so the
 * two arrays cannot drift in length without a type error. Both `Cover` and
 * `Packshot` index this by the project's position with no guard, and
 * `noUncheckedIndexedAccess` is off — without the tuple a short COVERS is a
 * runtime TypeError on `spec.year` that compiles clean.
 *
 * Seven archetypes across eleven covers, ported from design/label.mjs. The
 * repeats are deliberate: a catalogue with eleven unique layouts is eleven
 * designs, not one label.
 */
export const COVERS: Catalogue<CoverSpec> = [
  // AC-001 Smart DocuStore — the index. The five lines are the actual verbs of
  // the extension, in the order a note moves through it.
  {
    archetype: 'G',
    dark: false,
    year: 2026,
    lines: ['promote(passage)', 'chunk()', 'embed()', 'search(meaning)', 'cite(day)'],
  },
  // AC-002 Restauranty — '86', the kitchen call for a table or dish that is gone.
  { archetype: 'A', dark: false, year: 2026, glyph: '86' },
  // AC-003 TickerMaster — the width axis carries it.
  { archetype: 'C', dark: false, year: 2026, l1: 'TICKER', l2: 'MASTER' },
  // AC-004 AI-SL — motion trail: the project is pose extraction.
  { archetype: 'D', dark: true, year: 2025, plot: 'trail' },
  { archetype: 'F', dark: true, year: 2025 },
  // AC-006 Secure File Sharing System — the empty set.
  //
  // U+00D8 Ø, NOT U+2205 ∅. The same mark either way — Bourbaki took the empty-set
  // sign from the Norwegian letter — but only one of them renders. next/font
  // ships exactly three Archivo faces (vietnamese, latin-ext, latin) and U+2205
  // is outside all three unicode-ranges, so the browser skips Archivo for that
  // codepoint no matter what the woff2 holds. No `subsets:` option in
  // app/(staff)/admin/layout.tsx fixes it either: Google cuts each file to its
  // declared range and Archivo publishes no subset carrying U+2205. The next
  // stack entry is `Archivo Fallback` = local(Arial), which lacks it too, so the
  // mark fell through to a symbol face at a single weight and was synthetically
  // bolded — a different family, weight and width from AC-002, which is this
  // same archetype at this same 34cqw. Archetype A is one glyph over ~62% empty
  // sleeve, so that glyph IS the cover. U+00D8 is inside the latin face's
  // U+0000-00FF range and in its cmap, so it draws as real Archivo ExtraBold.
  { archetype: 'A', dark: true, year: 2025, glyph: 'Ø' },
  // AC-007 BerkeleyTime — the enrolment grid is the artwork.
  { archetype: 'D', dark: true, year: 2025, plot: 'grid' },
  { archetype: 'E', dark: false, year: 2024 },
  // AC-009 Impression — warp-filtered concentric circles; the tremor is the subject.
  { archetype: 'B', dark: false, year: 2024, plate: 'impression' },
  { archetype: 'E', dark: true, year: 2023 },
  // AC-011 NASA Techrise ORBS — radial horizon and one ellipse.
  { archetype: 'B', dark: false, year: 2023, plate: 'horizon' },
]

/**
 * One cover: ground, the frozen label layer, and the archetype's artwork.
 *
 * Renders the artwork INSIDE the sleeve element, which is where
 * `container-type: inline-size` is declared. Every `cqw` in every archetype
 * resolves against that; move this markup out of the sleeve and all cover
 * typography collapses to zero with no error anywhere.
 */
export function Cover({ project, index }: { project: Project; index: number }) {
  const spec = COVERS[index]
  const props: ArtProps = {
    n: index,
    h: hue(index),
    accent: accent(index),
    ink: inkFor(index, spec.dark),
    deep: deep(index),
    catalogue: catalogueNumber(index),
    title: project.title,
    year: spec.year,
  }

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: ground(index, spec.dark) }} />

      {/* Archetypes B and D lay out around the strip and draw it themselves. */}
      {spec.archetype === 'B' || spec.archetype === 'D' ? null : (
        <IdentityStrip catalogue={props.catalogue} color={props.accent} />
      )}

      {art(spec, props, project)}

      <Colophon color={colophon(index, spec.dark)} />

      {/* The cover's own printed grain — one per cover, part of the frozen label
          layer. This is the stock the artwork is printed ON, and it sits below
          the jacket's board grain, ring wear and laminate (z 6-9), which belong
          to the physical sleeve rather than the print. Not a screen-space
          overlay: the staff layout already ships the single one of those. */}
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.035,
          mixBlendMode: 'multiply',
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <rect width="400" height="400" filter="url(#cr-stock)" />
      </svg>
    </>
  )
}

function art(spec: CoverSpec, props: ArtProps, project: Project) {
  switch (spec.archetype) {
    case 'A':
      return <ArchetypeA {...props} glyph={spec.glyph} />
    case 'B':
      return <ArchetypeB {...props} plate={spec.plate} />
    case 'C':
      // '' when a project lists no technologies, which archetype C renders as
      // nothing rather than a row of separators.
      return <ArchetypeC {...props} l1={spec.l1} l2={spec.l2} tech={techLine(project.technologies)} />
    case 'D':
      return <ArchetypeD {...props} plot={spec.plot} />
    case 'E':
      return <ArchetypeE {...props} dark={spec.dark} />
    case 'F':
      return <ArchetypeF {...props} />
    case 'G':
      return <ArchetypeG {...props} lines={spec.lines} />
  }
}
