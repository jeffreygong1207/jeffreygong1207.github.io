/**
 * Coursework data for the staff bookcase (/admin/coursework).
 *
 * SEMESTERS below is a hand-mirror of the `coursework` array inside
 * `components/Coursework.tsx`, which renders the public /coursework route and
 * is off-limits to staff-side work (spec §0.1). If a course is ever added
 * there, add it here too — a cross-file import is not available to us, so
 * nothing can enforce THAT link.
 *
 * What is enforced, at the foot of this file and in development only: every
 * semester named here reaches a shelf, every semester a shelf names exists
 * here, and the volume count matches. Those are the two hand links that CAN be
 * checked, and both used to lose data silently.
 *
 * 39 courses across 8 semesters: 6 + 6 + 1 + 5 + 6 + 5 + 5 + 5.
 *
 * Course numbers are NOT numeric ("C100", "60AC", "7B", "102A", "61A", "16A").
 * They are strings everywhere. Never parseInt a course code.
 */

// ---------------------------------------------------------------------------
// Mirror of components/Coursework.tsx
// ---------------------------------------------------------------------------

export const SEMESTERS: ReadonlyArray<{
  readonly semester: string
  readonly courses: readonly string[]
}> = [
  {
    semester: 'Fall 2023',
    courses: [
      'COMPSCI 61A - The Structure and Interpretation of Computer Programs',
      'ECON 2 - Introduction to Economics',
      'EECS 16A - Designing Information Devices and Systems I',
      'UGBA 10 - Principles of Business',
      'UGBA 196 - Special Topics in Business Administration',
      'UGBA 198 - Investment Banking',
    ],
  },
  {
    semester: 'Spring 2024',
    courses: [
      'COMLIT 60AC - Topics in the Literature of American Cultures',
      'COMPSCI 61B - Data Structures',
      'EECS 16B - Designing Information Devices and Systems II',
      'ELENG 198 - Hands on PCB Engineering',
      'UGBA 102A - Financial Accounting',
      'UGBA 105 - Leading People',
    ],
  },
  {
    semester: 'Summer 2024',
    courses: ['COMPSCI 70 - Discrete Mathematics and Probability Theory'],
  },
  {
    semester: 'Fall 2024',
    courses: [
      'COMPSCI 61C - Great Ideas of Computer Architecture (Machine Structures)',
      'COMPSCI 170 - Efficient Algorithms and Intractable Problems',
      'STAT 20 - Introduction to Probability and Statistics',
      'UGBA 101B - Macroeconomic Analysis for Business Decisions',
      'UGBA 107 - The Social, Political, and Ethical Environment of Business',
    ],
  },
  {
    semester: 'Spring 2025',
    courses: [
      'COMPSCI 161 - Computer Security',
      'COMPSCI 189 - Introduction to Machine Learning',
      'COMPSCI 195 - Social Implications of Computer Technology',
      'COMPSCI 198 - System Administration (Linux)',
      'DATA C100 - Principles & Techniques of Data Science',
      'UGBA 101A - Microeconomic Analysis for Business Decisions',
    ],
  },
  {
    semester: 'Fall 2025',
    courses: [
      'COMPSCI 164 - Programming Languages and Compilers',
      'COMPSCI 197 - Field Study',
      'ECON 162 - The Chinese Economy',
      'EECS 127 - Optimization Models in Engineering',
      'UGBA 196 - Special Topics in Business Administration',
    ],
  },
  {
    semester: 'Spring 2026',
    courses: [
      'COMPSCI 162 - Operating Systems and System Programming',
      'COMPSCI 185 - Deep Reinforcement Learning, Decision Making, and Control',
      'PHYSICS 7B - Physics for Scientists and Engineers',
      'UGBA 100 - Business Communication',
      'UGBA 103 - Introduction to Finance',
    ],
  },
  {
    semester: 'Fall 2026',
    courses: [
      'COMPSCI 182 - Designing, Visualizing and Understanding Deep Neural Networks',
      'UGBA 102B - Managerial Accounting',
      'UGBA 104 - Introduction to Business Analytics',
      'UGBA 106 - Marketing',
      'UGBA 133 - Investments',
    ],
  },
]

// ---------------------------------------------------------------------------
// Cloth (spec §2.2). Low chroma so the foil reads on every one.
//
// ECON is deliberately ochre and PHYS deliberately aubergine: the spec palette
// supersedes design/shelf.mjs here (#4A1F26 and #22242A respectively). A green
// spine disappears into a green wall.
// ---------------------------------------------------------------------------

export const CLOTH = {
  COMPSCI: '#1E2A44',
  EECS: '#2E3B47',
  UGBA: '#6B5434',
  ECON: '#7A5A1E',
  DATA: '#1C3B3E',
  /* Was #5A3159: LAB hue 327.4 with C* 30.2, which is pink-magenta, not
     aubergine, and the most chromatic dark in the set. #49395A holds L* at 27.0
     so nothing else on the spine retunes, drops C* to 22.5, and lands at hue
     310.2 -- inside the aubergine band. */
  PHYS: '#49395A',
  HUM: '#3A2440',
  ELENG: '#5A2F22',
  MATH: '#1F3A2E',
} as const

export type ClothKey = keyof typeof CLOTH

/**
 * Real course prefixes do not match the cloth keys one-for-one. This is
 * design/shelf.mjs's own resolution, made explicit: STAT sits with DATA,
 * PHYSICS with PHYS, COMLIT with HUM.
 */
const PREFIX_CLOTH: Readonly<Record<string, ClothKey>> = {
  COMPSCI: 'COMPSCI',
  EECS: 'EECS',
  UGBA: 'UGBA',
  ECON: 'ECON',
  DATA: 'DATA',
  STAT: 'DATA',
  PHYSICS: 'PHYS',
  COMLIT: 'HUM',
  ELENG: 'ELENG',
}

/**
 * One course-level override, also from shelf.mjs: CS 195 is a humanities
 * course wearing a CS number, and it is bound in humanities cloth.
 */
const COURSE_CLOTH: Readonly<Record<string, ClothKey>> = {
  'COMPSCI 195': 'HUM',
}

/**
 * Berkeley's subject-area names, for the catalogue row.
 *
 * Keyed on the course-code prefix and NOT on ClothKey, which is a different
 * question with a different answer: cloth folds STAT into DATA and COMLIT into
 * HUM so nine dyes cover thirty-nine books, and binds COMPSCI 195 in humanities
 * cloth. Binding is a material decision. The subject is a fact about the
 * course, so STAT 20 reads Statistics and COMPSCI 195 reads Computer Science.
 *
 * ClothKey has no MATH course today, so no MATH entry exists here either; an
 * unmapped prefix falls back to the prefix itself, which is at least true.
 */
const DEPARTMENT: Readonly<Record<string, string>> = {
  COMPSCI: 'Computer Science',
  EECS: 'Electrical Engineering and Computer Sciences',
  UGBA: 'Business Administration',
  ECON: 'Economics',
  DATA: 'Data Science',
  STAT: 'Statistics',
  PHYSICS: 'Physics',
  COMLIT: 'Comparative Literature',
  ELENG: 'Electrical Engineering',
}

/** Course codes are `PREFIX NUMBER`; the number is a string, never a number. */
function codePrefix(code: string): string {
  const at = code.indexOf(' ')
  return at === -1 ? code : code.slice(0, at)
}

export function departmentName(code: string): string {
  return DEPARTMENT[codePrefix(code)] ?? codePrefix(code)
}

/**
 * MATH is defined by the palette but no course carries it today. It is the
 * fallback so a future course with an unmapped prefix still renders as a book
 * rather than as an unstyled rectangle.
 */
const FALLBACK_CLOTH: ClothKey = 'MATH'

// ---------------------------------------------------------------------------
// Mastery guides (spec §2.2). 13 of the 39.
//
// All 13 are COMPSCI or EECS; none are UGBA. That asymmetry is real and the UI
// states it rather than hiding it.
// ---------------------------------------------------------------------------

const GUIDE_FILE_ID: Readonly<Record<string, string>> = {
  'COMPSCI 61A': '1GyMTJhwELZ-15KONE0AvomPqg5CRNkQs',
  'EECS 16A': '1PEoq9t6dz4DMUFbXs2oePzcHYs3itewD',
  'COMPSCI 61B': '1LsN3VQgYyj6O4KDrIw1S_6hY7-QcTs1M',
  'EECS 16B': '1k7lOhMEEmwblZgVBywZwP4M0ElSu0bA-',
  'COMPSCI 70': '1ZcchWCcyQXddAfO-2Whd2Kf3DIQ7rlqN',
  'COMPSCI 61C': '1y0yKy0T8ljejqfkgvcW86txMGn903h2A',
  'COMPSCI 170': '1P-Iyw4Ur8tksDnqp3ExyIEB7T2MeBQEw',
  'COMPSCI 161': '1KO5vCE-Rw5sSMODis0o20Y1UaEWk8dQG',
  'COMPSCI 189': '1csotvGhEYUl9N617bQ1oPxCvB8fwQdu1',
  'COMPSCI 164': '1MWRat4vGsKl7bhYUllP9rWdlN4zWSCcg',
  'EECS 127': '12tuBoUh9i06xk6v6GRje63Ntwl0l9zSw',
  'COMPSCI 162': '1o56kmkT5ZmadWAI31pjmB2ViAnxxVamf',
  'COMPSCI 185': '1nHGfxOrbBTR-nFfaHVRvN7dcIaNzKeOo',
}

// ---------------------------------------------------------------------------
// Geometry, transcribed from design/shelf.mjs.
//
// Widths are right-skewed (many thin, few thick) and heights fall into three
// classes plus an oversize — 196 / 208 / 212 / 232 — not 39 distinct values
// (rule 13). `short` is the SPINE title: the real course titles run to 61
// characters, which the auto-fit formula drives below its 4.6px floor and
// overflows. The full title is carried separately as accessible text.
//
// shelf.mjs's abbreviations are rekeyed here to the real course codes:
// CS -> COMPSCI, EE 198 -> ELENG 198, PHYS 7B -> PHYSICS 7B. All 39 map 1:1.
// Both UGBA 196 rows are (18, 196), so keying geometry on the code is safe
// even though keying a React key on it is not.
// ---------------------------------------------------------------------------

interface Geometry {
  readonly short: string
  readonly w: number
  readonly h: number
}

const GEOMETRY: Readonly<Record<string, Geometry>> = {
  // 2023 – 24
  'COMPSCI 61A': { short: 'Structure and Interpretation', w: 46, h: 208 },
  'ECON 2': { short: 'Introduction to Economics', w: 30, h: 196 },
  'EECS 16A': { short: 'Information Devices I', w: 42, h: 208 },
  'UGBA 10': { short: 'Principles of Business', w: 34, h: 196 },
  'UGBA 196': { short: 'Special Topics', w: 18, h: 196 },
  'UGBA 198': { short: 'Investment Banking', w: 18, h: 196 },
  'COMLIT 60AC': { short: 'American Cultures', w: 26, h: 196 },
  'COMPSCI 61B': { short: 'Data Structures', w: 52, h: 208 },
  'EECS 16B': { short: 'Information Devices II', w: 42, h: 208 },
  'ELENG 198': { short: 'Hands-on PCB', w: 18, h: 196 },
  'UGBA 102A': { short: 'Financial Accounting', w: 36, h: 196 },
  'UGBA 105': { short: 'Leading People', w: 28, h: 196 },
  'COMPSCI 70': { short: 'Discrete Mathematics', w: 48, h: 208 },
  // 2024 – 25
  'COMPSCI 61C': { short: 'Great Ideas of Architecture', w: 56, h: 212 },
  'COMPSCI 170': { short: 'Efficient Algorithms', w: 72, h: 232 },
  'STAT 20': { short: 'Probability and Statistics', w: 32, h: 208 },
  'UGBA 101B': { short: 'Macroeconomic Analysis', w: 34, h: 196 },
  'UGBA 107': { short: 'Ethics in Business', w: 30, h: 196 },
  'COMPSCI 161': { short: 'Computer Security', w: 50, h: 212 },
  'COMPSCI 189': { short: 'Machine Learning', w: 66, h: 232 },
  'COMPSCI 195': { short: 'Social Implications', w: 20, h: 196 },
  'COMPSCI 198': { short: 'System Administration', w: 20, h: 196 },
  'DATA C100': { short: 'Data Science', w: 54, h: 212 },
  'UGBA 101A': { short: 'Microeconomic Analysis', w: 34, h: 196 },
  // 2025 – 26
  'COMPSCI 164': { short: 'Programming Languages', w: 48, h: 212 },
  'COMPSCI 197': { short: 'Field Study', w: 18, h: 196 },
  'ECON 162': { short: 'The Chinese Economy', w: 32, h: 208 },
  'EECS 127': { short: 'Optimization Models', w: 44, h: 212 },
  'COMPSCI 162': { short: 'Operating Systems', w: 62, h: 232 },
  'COMPSCI 185': { short: 'Deep Reinforcement Learning', w: 50, h: 212 },
  'PHYSICS 7B': { short: 'Physics for Engineers', w: 58, h: 232 },
  'UGBA 100': { short: 'Business Communication', w: 28, h: 196 },
  'UGBA 103': { short: 'Introduction to Finance', w: 36, h: 196 },
  // 2026 – 27
  'COMPSCI 182': { short: 'Deep Neural Networks', w: 54, h: 212 },
  'UGBA 102B': { short: 'Managerial Accounting', w: 34, h: 196 },
  'UGBA 104': { short: 'Business Analytics', w: 32, h: 196 },
  'UGBA 106': { short: 'Marketing', w: 26, h: 196 },
  'UGBA 133': { short: 'Investments', w: 34, h: 196 },
}

const FALLBACK_GEOMETRY: Geometry = { short: '', w: 26, h: 196 }

/**
 * The longest hand-set spine title is 28 characters ('Structure and
 * Interpretation'); the shortest is 9. An unmapped course has no hand-set
 * title, and handing the auto-fit a 61-character catalogue title drives it
 * straight to the 4.6px floor, where the foil runs off the foot of the spine
 * and `.type`'s overflow guard silently eats the tail. Truncating at the top of
 * that range fails visibly instead — one ellipsis, at a word boundary where
 * there is one near enough to be worth it. The full title is carried
 * separately as accessible text either way.
 */
const SPINE_TITLE_MAX = 28

function spineTitle(title: string): string {
  if (title.length <= SPINE_TITLE_MAX) return title
  const cut = title.slice(0, SPINE_TITLE_MAX - 1)
  const lastSpace = cut.lastIndexOf(' ')
  const kept = lastSpace > SPINE_TITLE_MAX / 2 ? cut.slice(0, lastSpace) : cut
  return `${kept.trimEnd()}\u2026`
}

/**
 * 2–4 books leaning 3–7° (rule 14). Keyed `${shelfIndex}-${positionIndex}`,
 * exactly as design/shelf.mjs picks them; everything else stands upright.
 */
const LEAN: Readonly<Record<string, number>> = {
  '0-4': 3,
  '1-8': 5,
  '2-1': -4,
  '3-4': -7,
}

/** Books per shelf in the dye-lot stride. Not a count — a fixed multiplier. */
const DYE_STRIDE = 13

// ---------------------------------------------------------------------------
// Shelves — one per academic year, matching design/shelf.mjs exactly.
// 13 + 11 + 10 + 5 = 39.
// ---------------------------------------------------------------------------

const ACADEMIC_YEARS: ReadonlyArray<{
  readonly label: string
  readonly semesters: readonly string[]
}> = [
  { label: '2023 – 24', semesters: ['Fall 2023', 'Spring 2024', 'Summer 2024'] },
  { label: '2024 – 25', semesters: ['Fall 2024', 'Spring 2025'] },
  { label: '2025 – 26', semesters: ['Fall 2025', 'Spring 2026'] },
  { label: '2026 – 27', semesters: ['Fall 2026'] },
]

export interface Volume {
  /** `${semester}-${code}` — UGBA 196 is taken twice, so the code alone is not unique. */
  readonly key: string
  readonly semester: string
  readonly code: string
  /** Full catalogue title, as accessible text. Never rendered on the spine. */
  readonly title: string
  /** Short spine title from design/shelf.mjs, sized to survive the auto-fit floor. */
  readonly shortTitle: string
  readonly cloth: string
  readonly clothKey: ClothKey
  readonly width: number
  readonly height: number
  /** Degrees; 0 for the 35 upright volumes. */
  readonly lean: number
  /** `i + shelfIndex * 13` — drives hue drift, value drift and weave phase. */
  readonly dyeIndex: number
  /** Google Drive file id for the mastery guide, or null. 13 of 39. */
  readonly guideId: string | null
}

export interface Shelf {
  readonly label: string
  readonly volumes: readonly Volume[]
  /** Tallest volume on the shelf; the book row is this + 12. */
  readonly maxHeight: number
}

/** Course entries are one flat string split on the FIRST ' - '. No title in the source contains a second one. */
function splitEntry(entry: string): { code: string; title: string } {
  const at = entry.indexOf(' - ')
  if (at === -1) return { code: entry, title: entry }
  return { code: entry.slice(0, at), title: entry.slice(at + 3) }
}

function clothKeyFor(code: string): ClothKey {
  const override = COURSE_CLOTH[code]
  if (override) return override
  const prefix = code.slice(0, code.indexOf(' ') === -1 ? code.length : code.indexOf(' '))
  return PREFIX_CLOTH[prefix] ?? FALLBACK_CLOTH
}

function buildShelves(): Shelf[] {
  const bySemester = new Map(SEMESTERS.map((s) => [s.semester, s.courses]))

  return ACADEMIC_YEARS.map((year, shelfIndex) => {
    const entries = year.semesters.flatMap((name) =>
      (bySemester.get(name) ?? []).map((entry) => ({ semester: name, ...splitEntry(entry) })),
    )

    const volumes: Volume[] = entries.map((entry, i) => {
      const geometry = GEOMETRY[entry.code] ?? FALLBACK_GEOMETRY
      const clothKey = clothKeyFor(entry.code)
      return {
        key: `${entry.semester}-${entry.code}`,
        semester: entry.semester,
        code: entry.code,
        title: entry.title,
        shortTitle: geometry.short || spineTitle(entry.title),
        cloth: CLOTH[clothKey],
        clothKey,
        width: geometry.w,
        height: geometry.h,
        lean: LEAN[`${shelfIndex}-${i}`] ?? 0,
        dyeIndex: i + shelfIndex * DYE_STRIDE,
        guideId: GUIDE_FILE_ID[entry.code] ?? null,
      }
    })

    return {
      label: year.label,
      volumes,
      maxHeight: volumes.reduce((tallest, v) => Math.max(tallest, v.height), 0),
    }
  })
}

export const SHELVES: readonly Shelf[] = buildShelves()

export const TOTAL_VOLUMES = SHELVES.reduce((n, shelf) => n + shelf.volumes.length, 0)

export const GUIDE_COUNT = SHELVES.reduce(
  (n, shelf) => n + shelf.volumes.filter((v) => v.guideId !== null).length,
  0,
)

export function guideUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`
}

/*
  SEMESTERS is a hand mirror of components/Coursework.tsx and ACADEMIC_YEARS is
  a hand mirror of SEMESTERS. Both have a silent-loss failure mode: a course
  added to a semester that no academic year claims simply never reaches a
  shelf, and nothing anywhere says so. Fail loudly in development instead —
  this is stripped from the production build, so it costs the deployed bundle
  nothing and can never take the page down in front of a reader.
*/
if (process.env.NODE_ENV !== 'production') {
  const shelved = new Set(ACADEMIC_YEARS.flatMap((year) => year.semesters))
  const dropped = SEMESTERS.filter((s) => !shelved.has(s.semester)).map((s) => s.semester)
  if (dropped.length > 0) {
    throw new Error(
      `lib/coursework.ts: ${dropped.join(', ')} is in SEMESTERS but no ACADEMIC_YEARS entry ` +
        'claims it, so its courses would never be shelved. Add it to a year.',
    )
  }

  const missing = [...shelved].filter((name) => !SEMESTERS.some((s) => s.semester === name))
  if (missing.length > 0) {
    throw new Error(
      `lib/coursework.ts: ACADEMIC_YEARS names ${missing.join(', ')}, which is not in SEMESTERS.`,
    )
  }

  const expected = SEMESTERS.reduce((n, s) => n + s.courses.length, 0)
  if (TOTAL_VOLUMES !== expected) {
    throw new Error(
      `lib/coursework.ts: ${expected} courses in SEMESTERS but ${TOTAL_VOLUMES} volumes shelved.`,
    )
  }
}
