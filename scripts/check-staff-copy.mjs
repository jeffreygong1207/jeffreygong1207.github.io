#!/usr/bin/env node
/**
 * check-staff-copy — a gate on what the staff surfaces SAY.
 *
 * The staff area shipped with design notes rendered as UI: rationale for why an
 * object was drawn a certain way, the names of the source files that drew it,
 * spec section numbers, and a list of what the owner still owed the product.
 * None of that is page text. A product surface states what it is and shows the
 * content; it does not explain itself, cite itself, or keep score.
 *
 * This checks the rendered strings only. Code comments are exempt on purpose —
 * `§2.3` and `lib/experience.ts` are exactly the right thing to write in a
 * comment and exactly the wrong thing to print on a page — so the file is
 * stripped of comments before anything is matched, and only JSX text nodes and
 * string/template literals are searched.
 *
 * Exits non-zero on the first offending file. Run: node scripts/check-staff-copy.mjs
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')

/**
 * Every tree that renders staff UI. `components/admin` is on this list because
 * it is staff UI by any test that matters — the sidebar, the post editor and
 * the toolbar are on screen behind the login exactly as much as anything under
 * `components/staff` — and a gate that stopped at the folder name would have
 * left the editor free to grow the same notes the rest of the area just lost.
 * Public routes are NOT scanned: `app/(site)` is out of scope for this work.
 */
const ROOTS = [
  join(ROOT, 'app', '(staff)'),
  join(ROOT, 'components', 'staff'),
  join(ROOT, 'components', 'admin'),
]
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs'])

/**
 * Each rule is matched against one trimmed line of rendered text at a time, so
 * `^` anchors to the start of a line the reader would actually see rather than
 * to the start of the file.
 */
const RULES = [
  { name: 'source-file name', re: /\.tsx?\b/, why: 'a UI never names its own source files' },
  { name: 'spec reference', re: /§/, why: 'spec sections are for the spec, not the page' },
  { name: 'TODO', re: /TODO/, why: 'unfinished work is not page copy' },
  { name: 'work-owed list', re: /Needed before/, why: 'the product does not bill the owner' },
  { name: 'rationale heading', re: /^Why /, why: 'headings name the content below them' },
  { name: 'EMPTY placeholder', re: /EMPTY/, why: 'one empty state per region, never a badge per row' },
  { name: 'data-shape aside', re: /on file/, why: 'describes the record, not the thing' },
  { name: 'data-shape aside', re: /already exist/, why: 'describes the record, not the thing' },
]

function walk(dir) {
  let out = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      out = out.concat(walk(full))
    } else {
      const dot = entry.lastIndexOf('.')
      if (dot > 0 && EXTENSIONS.has(entry.slice(dot))) out.push(full)
    }
  }
  return out
}

/**
 * Blank out `//` and block comments while leaving string and template literals
 * intact, so a `/* *\/` sequence inside a string cannot swallow real copy and a
 * `//` inside a URL cannot blank the rest of the line. Characters are replaced
 * with spaces rather than removed so line and column numbers survive.
 */
function stripComments(src) {
  const out = src.split('')
  let i = 0
  let state = 'code'
  let quote = ''
  while (i < src.length) {
    const c = src[i]
    const next = src[i + 1]
    if (state === 'code') {
      if (c === '/' && next === '/') {
        state = 'line'
        out[i] = out[i + 1] = ' '
        i += 2
        continue
      }
      if (c === '/' && next === '*') {
        state = 'block'
        out[i] = out[i + 1] = ' '
        i += 2
        continue
      }
      if (c === "'" || c === '"' || c === '`') {
        state = 'string'
        quote = c
      }
      i += 1
      continue
    }
    if (state === 'string') {
      if (c === '\\') {
        i += 2
        continue
      }
      if (c === quote) state = 'code'
      i += 1
      continue
    }
    if (state === 'line') {
      if (c === '\n') state = 'code'
      else out[i] = ' '
      i += 1
      continue
    }
    // block
    if (c === '*' && next === '/') {
      out[i] = out[i + 1] = ' '
      state = 'code'
      i += 2
      continue
    }
    if (c !== '\n') out[i] = ' '
    i += 1
  }
  return out.join('')
}

/** Import and export specifiers are module paths, not copy. */
function stripModuleSpecifiers(src) {
  return src.replace(/\bfrom\s*(['"])(?:\\.|(?!\1).)*\1/g, (m) => ' '.repeat(m.length))
}

/**
 * Everything a reader could end up seeing: JSX text nodes, plus every string and
 * template literal left in the file. Literals are included because plenty of
 * staff copy arrives through a variable — the entrance notes on /admin, the
 * empty-state strings — and a gate that only read JSX text would miss all of it.
 */
function renderedChunks(src) {
  const chunks = []
  const push = (text, index) => {
    if (text.trim()) chunks.push({ text, line: src.slice(0, index).split('\n').length })
  }

  const jsxText = /(?<=>)([^<>{}]+)(?=<)/g
  for (let m; (m = jsxText.exec(src)); ) push(m[1], m.index)

  const literal = /(['"`])((?:\\.|(?!\1)[\s\S])*)\1/g
  for (let m; (m = literal.exec(src)); ) push(m[2], m.index)

  return chunks
}

const failures = []

for (const dir of ROOTS) {
  for (const file of walk(dir)) {
    const src = readFileSync(file, 'utf8')
    const scannable = stripModuleSpecifiers(stripComments(src))
    for (const { text, line } of renderedChunks(scannable)) {
      for (const raw of text.split('\n')) {
        const trimmed = raw.trim()
        if (!trimmed) continue
        for (const rule of RULES) {
          if (rule.re.test(trimmed)) {
            failures.push({
              file: relative(ROOT, file).split(sep).join('/'),
              line,
              rule: rule.name,
              why: rule.why,
              text: trimmed.length > 96 ? `${trimmed.slice(0, 93)}...` : trimmed,
            })
          }
        }
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Design notes found in staff UI copy:\n')
  for (const f of failures) {
    console.error(`  ${f.file}:${f.line}  [${f.rule}] ${f.why}`)
    console.error(`    ${f.text}\n`)
  }
  console.error(
    `${failures.length} offending string${failures.length === 1 ? '' : 's'}. ` +
      'Delete rather than reword: rationale has no shorter correct version.'
  )
  process.exit(1)
}

console.log('Staff copy is clean.')
