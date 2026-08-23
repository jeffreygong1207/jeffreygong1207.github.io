import type { ArtProps } from './types'

/**
 * G — THE INDEX.
 *
 * The Sacred Bones formula: no image at all. Title, one italic line of
 * attribution, a rule, then the contents set as a list. The formula never
 * changes, which is exactly why it works across a catalogue.
 *
 * AC-001 Smart DocuStore — and the one project with no screenshot on the public
 * side, which is fitting: this archetype never wanted one.
 */
export function ArchetypeG({ ink, title, year, lines }: ArtProps & { lines: string[] }) {
  return (
    <div style={{ position: 'absolute', left: '6%', right: '6%', top: '18%' }}>
      <div
        aria-hidden="true"
        style={{
          fontFamily: 'var(--salon-font-grotesk)',
          fontWeight: 700,
          fontSize: '6.5cqw',
          letterSpacing: '-.02em',
          textTransform: 'uppercase',
          color: ink,
          lineHeight: 1,
        }}
      >
        {title}
      </div>
      {/* Typeface two of two on this cover. EB Garamond italic against Archivo
          is the whole contrast; a third family would break the label system.

          aria-hidden with the rest of the sleeve type: 2.2cqw is 6.16px at the
          280px jacket ceiling and 3.96px at the 180px floor, under the 8px
          legibility floor in spec 3 at every size this page renders. The year
          it carries is real text at 10px in `.metaFile` below the shot.

          The year alone. It previously read 'a program written in {year}', which
          asserts a form no project's data claims — this archetype can receive
          any of the eleven, so it may only print what is true of all of them. */}
      <div
        aria-hidden="true"
        style={{
          fontFamily: 'var(--salon-font-garamond)',
          fontStyle: 'italic',
          fontSize: '2.2cqw',
          color: ink,
          opacity: 0.78,
          marginTop: '1.4cqw',
        }}
      >
        {year}
      </div>
      <div
        aria-hidden="true"
        style={{ width: '38%', height: '1px', background: ink, opacity: 0.4, margin: '2.4cqw 0 1.6cqw' }}
      />
      {/* The contents list. 1.4cqw is 3.92px at the 280px ceiling — printed matter at
          shelf distance, not readable UI — so it is artwork, not content: the
          five verbs are a drawn index of what the extension does, and nothing
          in them is project data that exists nowhere else. */}
      {lines.map((line) => (
        <div
          key={line}
          aria-hidden="true"
          style={{
            fontFamily: 'var(--salon-font-mono)',
            fontSize: '1.4cqw',
            letterSpacing: '.08em',
            color: ink,
            opacity: 0.82,
            padding: '.35cqw 0',
          }}
        >
          {line}
        </div>
      ))}
    </div>
  )
}
