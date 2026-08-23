#!/usr/bin/env node
/**
 * verify-tokens — assert the Salon custom properties actually survived into
 * the shipped CSS.
 *
 * WHY THIS EXISTS. A deploy went out green with the globals.css custom
 * properties missing from the build output. Nothing failed: `next build`
 * succeeded, the bundle was served, the pages rendered. But every
 * `var(--salon-plate)` resolved to nothing while the hardcoded gradients in
 * the component modules survived, so the staff area shipped as unfilled
 * outlines on an unpainted ground — which reads, accurately, as "a flat
 * rounded rectangle with no depth". A build that compiles proves the CSS
 * parsed. It does not prove the CSS arrived.
 *
 * TWO HALVES, and they answer different questions.
 *
 *   (a) BUILD    default. Reads the CSS this build just emitted and asserts
 *                every `:root` token in app/globals.css is present AND still
 *                carries its declared value. Needs no network and no auth, so
 *                it can run in CI on every commit. Catches the drop, and
 *                catches a stale cache serving yesterday's values under
 *                today's names.
 *
 *   (b) LIVE     `--live <url>`. Fetches a deployed page and the stylesheets
 *                it links, then runs the same assertions against what the CDN
 *                is actually serving. This is the half that proves the deploy.
 *                (a) can only ever prove the build machine got it right.
 *
 * USE
 *   node scripts/verify-tokens.mjs
 *   node scripts/verify-tokens.mjs --dir .next/static
 *   node scripts/verify-tokens.mjs --live https://jeffreygong.dev/
 *   node scripts/verify-tokens.mjs --live https://jeffreygong.dev/about   (public, no cookie)
 *
 * /admin is behind Google OAuth, so the live half needs either a session
 * cookie (copy it out of DevTools > Application > Cookies; it is a secret,
 * pass it through an env var and never commit it) or a preview deployment with
 * protection off. Any staff route works — they all load the same global sheet.
 *
 * Wired as `postbuild`, which npm runs after `npm run build`. If the Vercel
 * project's Build Command is ever changed from `npm run build` to a bare
 * `next build`, npm lifecycle scripts stop running and this check silently
 * stops guarding the thing it was written to guard.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..')
const SOURCE = join(ROOT, 'app', 'globals.css')

/**
 * Tokens that must exist in the source at all. Everything else is discovered
 * from globals.css, which keeps this script from drifting as tokens are added
 * — but a discovered list alone would pass vacuously if someone deleted a
 * token, since there would be nothing left to look for. These are the load
 * bearing ones: the ground and the plate the whole ladder hangs off, the two
 * reading surfaces, and the motion contract.
 */
const REQUIRED_IN_SOURCE = [
  '--salon-ground',
  '--salon-plate',
  '--salon-raised',
  '--salon-ink',
  '--salon-sheet',
  '--salon-sheet-ink',
  '--salon-accent',
  '--salon-ease',
  '--salon-dur-ui',
  '--salon-dur-reveal',
  '--salon-stagger',
]

/**
 * Rules, not properties. A dropped `@layer` or a mangled at-rule takes these
 * with it and leaves the tokens looking fine, so the presence of a token is
 * not on its own evidence that the sheet is intact.
 *
 * Every entry is a rule some staff surface actually renders. A canary nobody
 * renders can only ever prove the file arrived, never that the file arrived
 * with the part anyone depends on — `.salon-enter` sat here for exactly that
 * reason and has been replaced by the two grounds. `prefers-reduced-motion`
 * carries the at-rule half on its own: it is the one at-rule in globals.css
 * that is not conditional on any component being on the page.
 */
const REQUIRED_SELECTORS = [
  '.salon-shell',
  '.salon-plate',
  '.salon-sheet',
  '.salon-grain',
  '.salon-h1',
  '.salon-label',
  '.salon-focus',
  'prefers-reduced-motion',
]

// --- CSS parsing -----------------------------------------------------------

/** Replace comments with spaces so brace counting and offsets both survive. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
}

/**
 * The `:root` block that applies unconditionally — NOT the one nested inside
 * `@media (prefers-reduced-motion: reduce)`, which zeroes the durations and
 * would otherwise be read as the declared values.
 */
function topLevelRootBlock(css) {
  const src = stripComments(css)
  const pattern = /:root\s*\{/g
  for (let m; (m = pattern.exec(src)); ) {
    let depth = 0
    for (let i = 0; i < m.index; i += 1) {
      if (src[i] === '{') depth += 1
      else if (src[i] === '}') depth -= 1
    }
    if (depth !== 0) continue

    let i = m.index + m[0].length
    let open = 1
    while (i < src.length && open > 0) {
      if (src[i] === '{') open += 1
      else if (src[i] === '}') open -= 1
      i += 1
    }
    return src.slice(m.index + m[0].length, i - 1)
  }
  return null
}

function parseDeclarations(block) {
  const out = new Map()
  const pattern = /(--salon-[a-z0-9-]+)\s*:\s*([^;]+);/gi
  for (let m; (m = pattern.exec(block)); ) out.set(m[1].toLowerCase(), m[2].trim())
  return out
}

// --- value comparison ------------------------------------------------------

/**
 * Colours have to be compared as colours. The minifier rewrites
 * `rgba(221, 238, 255, 0.14)` to `#ddeeff24`, which is the same colour and a
 * completely different string. Returns [r, g, b, a] with a in 0-255.
 */
function parseColor(value) {
  const s = value.trim().toLowerCase()

  const hex = /^#([0-9a-f]{3,8})$/.exec(s)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    if (h.length === 6) h += 'ff'
    if (h.length !== 8) return null
    return [0, 2, 4, 6].map((i) => parseInt(h.slice(i, i + 2), 16))
  }

  const fn = /^rgba?\(([^)]+)\)$/.exec(s)
  if (fn) {
    const parts = fn[1].split(/[,\s/]+/).filter(Boolean).map(Number)
    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null
    const alpha = parts.length > 3 && !Number.isNaN(parts[3]) ? parts[3] : 1
    return [
      Math.round(parts[0]),
      Math.round(parts[1]),
      Math.round(parts[2]),
      Math.round(alpha * 255),
    ]
  }

  return null
}

/**
 * Everything else, normalised to what a minifier would leave. Two rewrites
 * matter and both showed up the first time this ran:
 *
 *   leading zeroes go   `cubic-bezier(0.25, 1, 0.5, 1)` -> `cubic-bezier(.25,1,.5,1)`
 *                       `-0.01em`                       -> `-.01em`
 *   times get shorter   `240ms`                         -> `.24s`
 *
 * Neither is a change in meaning, so both are normalised away rather than
 * reported. Times are canonicalised to milliseconds on both sides.
 */
function normalize(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+/g, ' ')
    .replace(/(^|[\s,(-])0+(\.\d)/g, '$1$2')
    .replace(/(^|[\s,(-])(\d*\.?\d+)(ms|s)\b/g, (_, lead, num, unit) => {
      const ms = unit === 's' ? parseFloat(num) * 1000 : parseFloat(num)
      return `${lead}${Number(ms.toFixed(6))}ms`
    })
    .replace(/;+$/, '')
}

function sameValue(expected, actual) {
  const a = parseColor(expected)
  const b = parseColor(actual)
  if (a && b) return a.every((n, i) => n === b[i])
  return normalize(expected) === normalize(actual)
}

// --- sources of built CSS --------------------------------------------------

function walkCss(dir) {
  let out = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out = out.concat(walkCss(full))
    else if (entry.endsWith('.css')) out.push(full)
  }
  return out
}

async function fetchText(url, cookie) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: cookie ? { cookie } : undefined,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res.text()
}

/**
 * Every stylesheet the page links, plus anything inlined. Next content-hashes
 * chunk filenames, so the hrefs have to come out of the served HTML rather
 * than being guessed.
 */
async function liveSheets(pageUrl, cookie) {
  const html = await fetchText(pageUrl, cookie)
  const pageOrigin = new URL(pageUrl).origin
  const sources = []

  const inline = /<style[^>]*>([\s\S]*?)<\/style>/gi
  for (let m; (m = inline.exec(html)); ) {
    sources.push({ name: `${pageUrl} (inline <style>)`, css: m[1] })
  }

  const links = /<link\b[^>]*>/gi
  for (let m; (m = links.exec(html)); ) {
    const tag = m[0]
    if (!/stylesheet/i.test(tag) && !/\.css/i.test(tag)) continue
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)
    if (!href) continue
    const sheet = new URL(href[1], pageUrl)
    const abs = sheet.toString()
    // The cookie is a live /admin session. The page fetch above is the only
    // request that has any claim on it; a <link> in the served markup can point
    // anywhere (Vercel's toolbar injects a vercel.live stylesheet on preview
    // deployments), and sending the session to a third-party host leaks it.
    const credential = sheet.origin === pageOrigin ? cookie : undefined
    sources.push({ name: abs, css: await fetchText(abs, credential) })
  }

  if (sources.length === 0) {
    throw new Error(
      `no stylesheets found on ${pageUrl}. If this route is auth-gated the ` +
        'fetch probably followed a redirect to the login page — pass --cookie.'
    )
  }
  return sources
}

// --- the check itself ------------------------------------------------------

function checkSheets(sheets, expected) {
  const failures = []
  const declared = new Map()
  let corpus = ''

  for (const sheet of sheets) {
    corpus += sheet.css
    const pattern = /(--salon-[a-z0-9-]+)\s*:\s*([^;}]+)/gi
    for (let m; (m = pattern.exec(sheet.css)); ) {
      const name = m[1].toLowerCase()
      if (!declared.has(name)) declared.set(name, { value: m[2].trim(), where: sheet.name })
    }
  }

  for (const [name, want] of expected) {
    const got = declared.get(name)
    if (!got) {
      failures.push(`${name} is DECLARED IN SOURCE BUT ABSENT from the shipped CSS`)
    } else if (!sameValue(want, got.value)) {
      failures.push(`${name} shipped as \`${got.value}\`, source says \`${want}\``)
    }
  }

  for (const selector of REQUIRED_SELECTORS) {
    if (!corpus.includes(selector)) {
      failures.push(`rule \`${selector}\` is absent from the shipped CSS`)
    }
  }

  return { failures, checked: expected.size, sheets: sheets.length }
}

// --- entry -----------------------------------------------------------------

/**
 * Strict on purpose. A bare `--live` used to return undefined, which is falsy,
 * which silently ran the BUILD half and printed a success line — the script
 * written to catch a silent failure quietly failing in exactly that shape. A
 * flag with a missing or flag-shaped value is now an error, not a fallback.
 */
function flag(name, fallback) {
  const i = process.argv.indexOf(name)
  if (i === -1) return fallback
  const value = process.argv[i + 1]
  if (value === undefined || value.startsWith('--')) {
    console.error(
      `verify-tokens: ${name} needs a value.\n` +
        `  npm run check:live -- https://jeffreygong.dev/admin\n` +
        `  node scripts/verify-tokens.mjs ${name} <value>`
    )
    process.exit(1)
  }
  return value
}

const liveUrl = flag('--live', null)
const cookie = flag('--cookie', process.env.SALON_VERIFY_COOKIE || null)
const buildDir = resolve(ROOT, flag('--dir', join('.next', 'static')))

const rootBlock = topLevelRootBlock(readFileSync(SOURCE, 'utf8'))
if (!rootBlock) {
  console.error('verify-tokens: no top-level :root block in app/globals.css.')
  process.exit(1)
}

const expected = parseDeclarations(rootBlock)
const missingFromSource = REQUIRED_IN_SOURCE.filter((t) => !expected.has(t))
if (missingFromSource.length > 0) {
  console.error(
    `verify-tokens: ${missingFromSource.join(', ')} no longer declared at :root in app/globals.css.`
  )
  process.exit(1)
}

let sheets
if (liveUrl) {
  try {
    sheets = await liveSheets(liveUrl, cookie)
  } catch (err) {
    console.error(`verify-tokens: could not read ${liveUrl}\n  ${err.message}`)
    process.exit(1)
  }
} else {
  const files = walkCss(buildDir)
  if (files.length === 0) {
    console.error(
      `verify-tokens: no CSS under ${buildDir}. Run \`npm run build\` first, or pass --dir.`
    )
    process.exit(1)
  }
  sheets = files.map((f) => ({ name: f, css: readFileSync(f, 'utf8') }))
}

const { failures, checked, sheets: count } = checkSheets(sheets, expected)
const where = liveUrl ? liveUrl : buildDir

if (failures.length > 0) {
  console.error(`verify-tokens: FAILED against ${where}\n`)
  for (const f of failures) console.error(`  ${f}`)
  console.error(
    '\nThe Salon tokens did not survive into the served CSS. This is the failure ' +
      'that has shipped here before: the build goes green, the pages render, and ' +
      'every var(--salon-*) resolves to nothing while the hardcoded gradients in ' +
      'the component modules survive. Clear the build cache and redeploy; do not ' +
      'trust the green check.'
  )
  process.exit(1)
}

console.log(
  `verify-tokens: ${checked} tokens and ${REQUIRED_SELECTORS.length} rules present ` +
    `and correct across ${count} stylesheet${count === 1 ? '' : 's'} in ${where}.`
)

if (!liveUrl) {
  console.log(
    'This checked the build output only. A green build is not evidence the deploy ' +
      'is correct — the last drop happened between a green build and the CDN. Verify ' +
      'the deploy itself:\n' +
      '  node scripts/verify-tokens.mjs --live https://jeffreygong.dev/about\n' +
      'A PUBLIC route, and no cookie: globals.css is imported by the root layout, so\n' +
      'the token layer ships to every page. The staff routes need a session and the\n' +
      'cookie is usually not to hand, which made the check easy to skip — and this is\n' +
      'exactly the layer that went missing the time a green build served a white page.\n' +
      'Add --cookie "$SALON_VERIFY_COOKIE" with a staff URL only to check module CSS.\n' +
      'Or, in DevTools on the deployed page:\n' +
      "  getComputedStyle(document.documentElement).getPropertyValue('--salon-plate')\n" +
      `  -> expected \`${expected.get('--salon-plate')}\`; an empty string is the failure.`
  )
}
