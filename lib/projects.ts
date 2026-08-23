/**
 * Staff-side mirror of the project list.
 *
 * SOURCE OF TRUTH FOR THE PUBLIC SITE: `components/Projects.tsx`, which renders
 * the public /projects route and is off-limits to staff-side work. This file is
 * a deliberate DUPLICATE of the array in that component, not an import, for two
 * reasons:
 *
 *  1. `components/Projects.tsx` is a `'use client'` component whose data lives
 *     inside the render function. There is nothing to import.
 *  2. The crate's colour ring is pinned to the length of this array. An
 *     independent copy means a future change on the public side cannot silently
 *     re-hue eleven record sleeves.
 *
 * EXACTLY ELEVEN, IN THIS ORDER. Commit 1719ccb ("Add Applied Creativity to
 * Projects", on `main` at d3d8bda) prepends an "Applied Creativity" entry as the
 * FIRST element of the public array, making twelve, and adds a `site` link type.
 * That entry is deliberately EXCLUDED here: spec 2.3 pins the catalogue to
 * AC-001..AC-011 and the OKLCH ring to `H = 24 + (360/11)*n`, so adopting the
 * twelve-entry array would shift every hue by 2.7 degrees and leave the twelfth
 * project uncatalogued. Do not rebase this file onto `main` to "fix" it.
 *
 * If a twelfth project is ever genuinely wanted here, widen `Catalogue<T>` by
 * one slot, add the entry to PROJECTS, and add its cover spec to
 * `components/staff/covers`. The ring divides by `PROJECTS.length`, so the hues
 * re-space themselves; nothing else needs edits.
 */

/**
 * Exactly eleven of something, in catalogue order — the compile-time lock on the
 * coupling between this array and `COVERS` in components/staff/covers.
 *
 * `Cover` and `Packshot` both do `COVERS[index]` unguarded, and
 * `noUncheckedIndexedAccess` is off in tsconfig.json, so a plain `CoverSpec[]`
 * shorter than `PROJECTS` gives `spec.year` as a runtime TypeError with nothing
 * failing at build. Commit 1719ccb on `main` already adds a twelfth public
 * project, so this is a live hazard, not a hypothetical one. Typing both arrays
 * as the same fixed-length tuple makes the mismatch a type error instead: add a
 * twelfth project and PROJECTS stops compiling until this type and COVERS agree.
 *
 * Written out rather than generated recursively because the length IS the
 * documentation — the catalogue is AC-001..AC-011 and the ring divides by 11.
 */
export type Catalogue<T> = [T, T, T, T, T, T, T, T, T, T, T]

export interface ProjectLinks {
  github?: string
  demo?: string
  /**
   * Declared on the public type and mirrored for shape fidelity. Used by zero
   * of the eleven projects today; `projectLinks()` still resolves it so a
   * future paper link becomes clickable without a code change.
   */
  paper?: string
}

export interface Project {
  title: string
  description: string
  technologies: string[]
  /**
   * Ten of the eleven have one; Smart DocuStore does not. The crate does not
   * render screenshots — every sleeve is generated artwork from the frozen
   * label system — so nothing here dereferences it. Kept so the mirror matches
   * the public shape exactly.
   */
  image?: string
  links: ProjectLinks
}

export const PROJECTS: Catalogue<Project> = [
  {
    title: 'Smart DocuStore',
    description:
      'Chrome new-tab notepad that remembers. Promote a passage with ⌘⏎ and it is chunked, embedded, and searchable by meaning months later, with citations back to the day you wrote it.',
    technologies: ['React', 'TypeScript', 'Vite', 'Chrome MV3', 'Supabase', 'Deno', 'pgvector', 'Groq'],
    links: {},
  },
  {
    title: 'Restauranty',
    description:
      'Full-stack reservation platform built at LA Hacks 2026 to help restaurants minimize no-shows and recover empty tables. Features no-show risk scoring, verified waitlists, and role-based dashboards for restaurants and diners.',
    technologies: ['Next.js', 'TypeScript', 'MongoDB', 'Auth0', 'Claude AI', 'Twilio', 'Tailwind CSS', 'Vercel'],
    image: '/images/restauranty.png',
    links: {
      github: 'https://github.com/jeffreygong1207/restauranty',
      demo: 'https://devpost.com/software/restauranty',
    },
  },
  {
    title: 'TickerMaster',
    description:
      'Educational financial AI sandbox for retail traders to research tickers, simulate multi-agent trading strategies, and monitor watchlists with a 24/7 AI broker avatar.',
    technologies: ['React', 'TypeScript', 'FastAPI', 'Supabase', 'Modal', 'Perplexity', 'OpenAI', 'HeyGen'],
    image: '/images/tickermaster.jpg',
    links: {
      demo: 'https://devpost.com/software/tickermaster',
    },
  },
  {
    title: 'AI-SL',
    description:
      'Real-time ASL video generation platform (web app & Chrome extension) for language accessibility. Worked on ML pipeline for animation via vector search and real-time pose extraction.',
    technologies: ['Python', 'React', 'MediaPipe', 'Supabase'],
    image: '/images/ai-sl.jpg',
    links: {
      github: 'https://github.com/deenasun/ai-sl/tree/main',
    },
  },
  {
    title: 'Posthuman',
    description:
      'Full-stack asset management system with Mistral models for OCR and financial analysis. Built agent automation with LangChain and Ethereum/EigenLayer validation.',
    technologies: ['TypeScript', 'LangChain', 'Flask'],
    image: '/images/posthuman.jpg',
    links: {
      github: 'https://github.com/r-agni/posthuman',
    },
  },
  {
    title: 'Secure File Sharing System',
    description:
      'End-to-end encrypted file sharing system with secure storage, access control, and revocation. Worked on user authentication, per-file encryption, and key-management logic.',
    // Genuinely empty on the public side. `techLine()` returns '' for this one.
    technologies: [],
    image: '/images/secure-file-sharing.jpg',
    links: {},
  },
  {
    title: 'BerkeleyTime',
    description:
      'Real-time enrollment system using WebSockets and UCB API with data caching. Developed fuzzy search functionality and ML course recommendation engine.',
    technologies: ['Docker', 'TypeScript', 'Python', 'Redis'],
    image: '/images/berkeleytime.jpg',
    links: {},
  },
  {
    title: 'BetterUp',
    description:
      'Automated content auditing system and scalable dashboard platform for visualizing coach activity and generating performance metrics.',
    technologies: ['React', 'Next.js', 'Python', 'Pandas', 'AWS EC2', 'Vercel', 'Firebase'],
    image: '/images/betterup.jpg',
    links: {},
  },
  {
    title: 'Impression',
    description:
      'iPad app that predicts early onset dementia by analyzing drawing motions. Worked on machine learning algorithms to analyze touch sensor data.',
    technologies: ['Swift', 'FastAPI', 'Amazon Web Services', 'Uvicorn'],
    image: '/images/impression.jpg',
    links: {
      github: 'https://github.com/oliver-yangluo-chen/Impression',
    },
  },
  {
    title: 'Clearway Energy',
    description:
      'Automated energy production data verification and scalable data processing platform. Developed ETL pipelines for customers.',
    technologies: ['Python', 'SQL', 'Pandas', 'Power BI'],
    image: '/images/clearway.jpg',
    links: {},
  },
  {
    title: 'NASA Techrise Challenge - ORBS',
    description:
      'Worked on CS portions of NASA Techrise Challenge winning project. Programmed M4 Metro Microcontroller using C++ to control LED lighting and cameras for monitoring biodegradable pods during suborbital flight.',
    technologies: ['C++', 'Microcontroller Programming'],
    image: '/images/nasa-orbs.jpg',
    links: {},
  },
]

/**
 * `AC-001` .. `AC-011`, mapped 1:1 onto PROJECTS order. On a racked sleeve this
 * is the only thing visible, so it is real text on every cover.
 */
export function catalogueNumber(index: number): string {
  return `AC-${String(index + 1).padStart(3, '0')}`
}

/**
 * The OKLCH ring's hue, spec 2.3: `H = 24 + (360/11)*n`.
 *
 * The divisor is `PROJECTS.length`, not a literal 11, so a twelfth entry
 * re-spaces the ring instead of colliding with it. Lightness and chroma are
 * FIXED (see ./components/staff/covers/ring.ts) — varying them is what stops a
 * set of covers reading as one label.
 */
export function hue(index: number): string {
  return (24 + (360 / PROJECTS.length) * index).toFixed(1)
}

/**
 * `REACT · TYPESCRIPT · FASTAPI · SUPABASE`, for the specimen cover's foot.
 * Returns '' when a project has no technologies — Secure File Sharing System is
 * the real case — so callers render nothing rather than a stray separator.
 */
export function techLine(technologies: string[], max = 4): string {
  if (technologies.length === 0) return ''
  return technologies
    .slice(0, max)
    .map((tech) => tech.toUpperCase())
    .join(' · ')
}

export interface ResolvedLink {
  href: string
  /** Used in the link's accessible name; the packshot's own text is artwork. */
  label: string
}

/**
 * Splits a project's links into the one the packshot itself points at and any
 * others, which render as separate anchors BELOW the packshot. Nesting a second
 * anchor inside the packshot anchor would be invalid HTML and unreachable by
 * keyboard, and only Restauranty has two links, so this stays cheap.
 *
 * Six of eleven return `{ primary: null, secondary: [] }`. Those packshots must
 * not be focusable and must not look interactive (spec 3). The page therefore
 * holds six focusable objects, not six anchors: five packshot links plus
 * Restauranty's second destination below its shot.
 */
export function projectLinks(project: Project): {
  primary: ResolvedLink | null
  secondary: ResolvedLink[]
} {
  const all: ResolvedLink[] = []
  if (project.links.github) all.push({ href: project.links.github, label: 'source on GitHub' })
  if (project.links.demo) all.push({ href: project.links.demo, label: 'demo' })
  if (project.links.paper) all.push({ href: project.links.paper, label: 'paper' })

  return { primary: all[0] ?? null, secondary: all.slice(1) }
}
