#!/usr/bin/env node
/**
 * check-experience-sync — a gate on the one array this repo keeps in two places.
 *
 * `components/Experience.tsx` holds the roles inline and renders a public
 * route, which spec §0.1 puts off-limits, so the staff slate reads its own copy
 * from `lib/experience.ts` instead. Two arrays, no shared source, nothing in
 * the type system connecting them: adding a seventh role to the public
 * component compiles clean, ships clean, and leaves the slate quietly showing
 * six. A tuple type on the staff file cannot catch this — the drift happens in
 * the OTHER file, which the staff file never imports.
 *
 * So compare the text. Both arrays are plain object literals with the same
 * three keys in the same order, which is exactly the shape a regex can read
 * honestly. `description` and `url` exist only on the staff type and are
 * ignored: they are the staff file's reason to exist, not drift.
 *
 * Exits non-zero on any mismatch. Run: node scripts/check-experience-sync.mjs
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

const SOURCES = [
  { label: 'components/Experience.tsx', anchor: /const\s+experiences\s*=\s*\[/ },
  { label: 'lib/experience.ts', anchor: /EXPERIENCE_ROLES\s*:[^=]*=\s*\[/ },
]

/**
 * Slice from the array's opening bracket to its match, counting depth, so a
 * later array in the same file can never be picked up by a greedy match.
 *
 * Both anchors END at that bracket, and the offset is taken from the end of the
 * match for that reason: `EXPERIENCE_ROLES: ExperienceRole[] = [` contains an
 * earlier `[` in the type annotation, and searching forward from the start of
 * the match finds the empty `[]` instead of the array.
 */
function arrayBody(src, anchor, label) {
  const start = src.match(anchor)
  if (!start) throw new Error(`${label}: could not find the roles array`)
  let i = start.index + start[0].length - 1
  let depth = 0
  for (let j = i; j < src.length; j++) {
    if (src[j] === '[') depth++
    else if (src[j] === ']' && --depth === 0) return src.slice(i + 1, j)
  }
  throw new Error(`${label}: roles array is unterminated`)
}

/**
 * Matches the OPENING quote and requires the same one to close, so an
 * apostrophe inside a double-quoted value is just a character. The first
 * version excluded all three quote marks from the value, which truncated
 * `"Moody's Analytics"` to `Moody` — and since it truncated the staff copy
 * identically, two genuinely different employers compared equal and the gate
 * passed. Employer names with apostrophes are common.
 */
const FIELD = (key) => new RegExp(`${key}\\s*:\\s*(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*)\\1`)

function roles(label, anchor) {
  const src = readFileSync(resolve(ROOT, label), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  const entries = arrayBody(src, anchor, label)
    .split(/\}\s*,?/)
    .map((e) => e.trim())
    .filter((e) => /[A-Za-z]/.test(e))

  return entries.map((entry) => {
    const org = entry.match(FIELD('organization'))
    const pos = entry.match(FIELD('position'))
    const date = entry.match(FIELD('date'))
    if (org && pos && date) return `${org[2]} — ${pos[2]} — ${date[2]}`
    // NOT dropped. An entry this cannot read is the exact shape drift takes —
    // a role added with a hoisted constant, a spread, or a helper call for the
    // date. Silently skipping it let the gate report "in sync (6 roles)" while
    // the public component rendered 7.
    return `UNREADABLE ENTRY in ${label}: ${entry.replace(/\s+/g, ' ').slice(0, 90)}`
  })
}

const [publicRoles, staffRoles] = SOURCES.map((s) => roles(s.label, s.anchor))

// Zero roles is never a real state; it means the array shape moved out from
// under the parser. Fail loudly as a broken gate rather than quietly as drift.
for (const [label, parsed] of [
  ['components/Experience.tsx', publicRoles],
  ['lib/experience.ts', staffRoles],
]) {
  if (parsed.length === 0) {
    console.error(`check-experience-sync: parsed zero roles from ${label}.`)
    console.error('The array shape changed and this gate can no longer read it. Fix the gate.')
    process.exit(1)
  }
}

const drift = []
for (let i = 0; i < Math.max(publicRoles.length, staffRoles.length); i++) {
  if (publicRoles[i] !== staffRoles[i]) {
    drift.push({ i, pub: publicRoles[i] ?? '(missing)', staff: staffRoles[i] ?? '(missing)' })
  }
}

if (drift.length > 0) {
  console.error('Experience roles have drifted between the public component and the staff copy:\n')
  for (const d of drift) {
    console.error(`  [${d.i}] components/Experience.tsx  ${d.pub}`)
    console.error(`  [${d.i}] lib/experience.ts          ${d.staff}\n`)
  }
  console.error(
    'The public component is the source of truth. Mirror the change into lib/experience.ts,\n' +
      'keeping any description/url already set on the staff entry.'
  )
  process.exit(1)
}

console.log(`Experience roles are in sync (${publicRoles.length} roles).`)
