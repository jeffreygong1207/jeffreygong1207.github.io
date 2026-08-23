#!/usr/bin/env node
/**
 * check-shadow-falloff — a gate on whether the objects are lit like objects.
 *
 * A cast shadow gets LIGHTER as it gets softer. The tight core under the point
 * of contact is the darkest part; the wide ambient skirt is the faintest. Every
 * multi-layer stack in the staff area once had this exactly backwards — alpha
 * rising as blur widened, so the broadest, softest layer was also the darkest.
 * That reads as smoke around the object rather than shadow under it, and it is
 * one of the loudest reasons a CSS-drawn object looks drawn.
 *
 * So: within one box-shadow, ordering layers by extent (spread + blur/2) must
 * not increase alpha.
 *
 * Only outer layers are compared. `inset` is a bevel or an occlusion term — a
 * different job with different rules, and mixing the two would make this gate
 * lie. Layers whose alpha is a calc() are evaluated at both endpoints of the
 * var() they interpolate, since a stack that is correct closed and inverted
 * open is still inverted. Anything unparseable is REPORTED, never skipped
 * silently: a gate that quietly ignores what it cannot read is worse than none.
 *
 * Exits non-zero on any inversion. Run: node scripts/check-shadow-falloff.mjs
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const DIRS = [join(ROOT, 'components', 'staff'), join(ROOT, 'app')]

/** Split a shadow list on commas that are not inside parentheses. */
function splitLayers(value) {
  const out = []
  let depth = 0
  let buf = ''
  for (const ch of value) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(buf.trim())
      buf = ''
    } else buf += ch
  }
  if (buf.trim()) out.push(buf.trim())
  return out
}

/** Every `name(...)` call in `str`, matched by balancing parentheses. */
function balancedCalls(str, name) {
  const out = []
  const re = new RegExp(`\\b${name}\\(`, 'g')
  let m
  while ((m = re.exec(str))) {
    let depth = 0
    for (let i = m.index + name.length; i < str.length; i++) {
      if (str[i] === '(') depth++
      else if (str[i] === ')' && --depth === 0) {
        out.push(str.slice(m.index, i + 1))
        re.lastIndex = i + 1
        break
      }
    }
  }
  return out
}

/** The layer with its colour function removed, so only lengths remain. */
function stripColour(layer) {
  const span = colourSpan(layer)
  return span ? (layer.slice(0, span[0]) + ' ' + layer.slice(span[1] + 1)).trim() : layer
}

/** [start, end] indices of the layer's colour function, or null. */
function colourSpan(layer) {
  const open = layer.search(/\b(?:rgba?|hsla?|color|oklch|lab|color-mix)\(/)
  if (open === -1) return null
  const start = layer.indexOf('(', open)
  let depth = 0
  for (let i = start; i < layer.length; i++) {
    if (layer[i] === '(') depth++
    else if (layer[i] === ')' && --depth === 0) return [open, i]
  }
  return null
}

/**
 * The alpha argument of the layer's colour, or null if the layer has no colour
 * function at all.
 *
 * Balances parentheses rather than pattern-matching, because the alpha is
 * routinely itself a calc() containing a var() — `rgba(6, 12, 8, calc(0.55 -
 * 0.13 * var(--open)))`. A regex that stops at the first `)` reads that as
 * having no alpha, and the first version of this gate then quietly assumed 1.0
 * for both layers of a stack, found them equal, and passed an inverted stack.
 */
function alphaArg(layer) {
  const span = colourSpan(layer)
  if (!span) return null
  const [open, end] = span
  const start = layer.indexOf('(', open)
  const body = layer.slice(start + 1, end)
  // color-mix() and friends carry no positional alpha this can read. Say so
  // rather than guessing 1.0 — a guessed opaque alpha is how a stack passes.
  if (/^color-mix\(/.test(layer.slice(open))) return null
  const args = splitLayers(body)
  if (args.length >= 4) return args[args.length - 1].trim()

  // Space-separated form: `rgb(0 0 0 / 40%)`. Unused in this repo today, but it
  // is one comma away from being written, and the comma-counting branch above
  // would read it as fully opaque — a silent pass, which is the one thing this
  // gate must never do.
  const slash = body.indexOf('/')
  if (slash !== -1) {
    const a = body.slice(slash + 1).trim()
    return a.endsWith('%') ? String(parseFloat(a) / 100) : a
  }
  return '1'
}

/** Evaluate `calc(a - b * var(--x))` at both endpoints; plain numbers pass through. */
function alphaValues(raw) {
  const plain = Number(raw)
  if (Number.isFinite(plain)) return [plain]
  const m = raw.match(/calc\(\s*([\d.]+)\s*([-+])\s*([\d.]+)\s*\*\s*var\([^)]*\)\s*\)/)
  if (m) {
    const base = Number(m[1])
    const delta = Number(m[3]) * (m[2] === '-' ? -1 : 1)
    return [base, base + delta]
  }
  return null
}

/**
 * How far the layer actually reaches: `spread + blur / 2`.
 *
 * Blur alone is not the softness of a layer. Two layers can share a blur of
 * 40px and be nothing alike — at spread +8 one is a broad halo, at spread -22
 * the other is pulled into a tight core under the object, and the tight one is
 * correctly the darker of the two. Ordering on blur called that an inversion.
 * Spread is the third length when four are present.
 *
 * A calc() collapses to the largest scale factor inside it, which is enough to
 * ORDER layers against each other — every calc() here is `var(--cr-px) * n`.
 */
function blurValue(layer) {
  // The colour comes off FIRST. Its alpha is routinely a calc(), and leaving it
  // in the string let it be counted as a length: in `.disc` every geometry
  // calc is two levels deep and so went unmatched, while the alpha calc matched
  // and became the third "length" — every layer computed an extent of 0 and the
  // gate degraded into "alphas must not increase in source order", passing a
  // fully inverted stack.
  let rest = stripColour(layer)

  // Balanced scan, not a regex. `calc(var(--cr-px) * (2 + 2 * var(--open)))`
  // nests two deep and the old one-level pattern could not see it.
  const calcs = balancedCalls(rest, 'calc')
  calcs.forEach((c, i) => {
    rest = rest.replace(c, ` @${i} `)
  })
  const lengths = []
  for (const tok of rest.trim().split(/\s+/)) {
    if (/^@\d+$/.test(tok)) {
      const body = calcs[Number(tok.slice(1))]
      const nums = (body.match(/[\d.]+/g) ?? []).map(Number)
      const scale = nums.filter((v) => v > 1)
      const mag = scale.length ? Math.max(...scale) : 0
      // `calc(var(--cr-px) * -6)` is a negative spread; the sign matters.
      lengths.push(/\*\s*-/.test(body) || /-\s*\d/.test(body) ? -mag : mag)
    } else if (/^-?[\d.]+px$/.test(tok)) {
      // Offsets are signed but their magnitude is irrelevant here; blur and
      // spread are what set extent, and blur is never negative.
      lengths.push(parseFloat(tok))
    } else if (tok === '0') {
      lengths.push(0)
    }
  }
  if (lengths.length < 3) return null
  const blur = Math.abs(lengths[2])
  const spread = lengths.length >= 4 ? lengths[3] : 0
  return spread + blur / 2
}

const findings = []
const unparsed = []

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.css')) check(full)
  }
}

function check(file) {
  // Comments are blanked rather than removed: deleting them shifts every line
  // number after the first comment, and a gate that reports the wrong line
  // sends you to the wrong declaration.
  const src = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) =>
    c.replace(/[^\n]/g, ' ')
  )
  const re = /box-shadow\s*:\s*([^;}]+)[;}]/g
  let m
  while ((m = re.exec(src))) {
    const line = src.slice(0, m.index).split('\n').length
    const where = `${relative(ROOT, file)}:${line}`
    const outer = splitLayers(m[1]).filter((l) => !/\binset\b/.test(l))
    if (outer.length < 2) continue

    const parsed = []
    for (const layer of outer) {
      const raw = alphaArg(layer)
      const blur = blurValue(layer)
      const alphas = raw === null ? null : alphaValues(raw)
      if (blur === null || alphas === null) {
        unparsed.push(`${where}  ${layer.replace(/\s+/g, ' ').slice(0, 80)}`)
        continue
      }
      parsed.push({ blur, alphas })
    }
    if (parsed.length < 2) continue

    const endpoints = Math.max(...parsed.map((p) => p.alphas.length))
    for (let e = 0; e < endpoints; e++) {
      const at = parsed
        .map((p) => ({ blur: p.blur, a: p.alphas[Math.min(e, p.alphas.length - 1)] }))
        .sort((x, y) => x.blur - y.blur)
      for (let i = 1; i < at.length; i++) {
        if (at[i].a > at[i - 1].a + 1e-9) {
          const tail = endpoints > 1 ? `   (at var() endpoint ${e})` : ''
          findings.push(
            `${where}` +
              `\n    extent ${at[i - 1].blur} at alpha ${at[i - 1].a}` +
              `  ->  extent ${at[i].blur} at alpha ${at[i].a}${tail}`
          )
          break
        }
      }
    }
  }
}

for (const d of DIRS) walk(d)

if (unparsed.length > 0) {
  console.error(`check-shadow-falloff: ${unparsed.length} layer(s) could not be read:`)
  console.error('')
  for (const u of unparsed) console.error(`  ${u}`)
  console.error('')
  console.error('Teach the parser these forms rather than leaving them unchecked.')
  process.exit(1)
}

if (findings.length > 0) {
  console.error('Shadow falloff is inverted — a softer layer is darker than a tighter one:')
  console.error('')
  for (const f of findings) {
    console.error(`  ${f}`)
    console.error('')
  }
  console.error('A cast shadow lightens as it widens. Order the alphas downward as blur grows.')
  process.exit(1)
}

console.log('Shadow falloff is monotonic in every multi-layer stack.')
