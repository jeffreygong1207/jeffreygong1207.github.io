/**
 * Staff-side copy of the roles rendered by `components/Experience.tsx`.
 *
 * Why a copy: that component holds the array inline, it is imported by
 * `app/(site)/about/page.tsx`, and it therefore renders a public route — which
 * spec §0.1 puts off-limits. §0.1 does allow adding to `lib/`, so the type
 * extension §2.4 asks for lives here and the public component stays
 * byte-identical. If a role changes there, change it here too; there is no
 * shared source to derive from without editing the public file.
 *
 * §2.4 calls the middle field `title`; the actual key in the source array is
 * `position`. This mirrors the source, not the prose.
 */
export interface ExperienceRole {
  organization: string
  position: string
  date: string
  /**
   * §2.4: added by this branch, and deliberately left undefined on every role.
   * Nothing is written up for any of these jobs and inventing copy for someone
   * else's employment history is not a thing a design pass gets to do. The
   * slate renders a marked placeholder instead — see `Slate.module.css`.
   */
  description?: string
  /** Same: added, empty. A role becomes focusable only once this is set. */
  url?: string
  /**
   * Path under `public/images/companies/`. Optional because the marks are not
   * all on file: `stripe.png` is absent, and this repo is public, so the fix is
   * a typographic fallback in the UI rather than committing someone else's
   * trademark. berkeley/betterup/clearway are also on disk but are 0 bytes and
   * belong to no role here.
   */
  logo?: string
}

/** Newest first, exactly as ordered in `components/Experience.tsx`. */
export const EXPERIENCE_ROLES: ExperienceRole[] = [
  {
    organization: 'Stripe',
    position: 'Software Engineering Intern',
    date: 'Summer 2026',
    // No logo: see the `logo` note above.
  },
  {
    organization: 'Snowflake',
    position: 'Software Engineering Intern',
    date: 'Fall 2025',
    logo: '/images/companies/snowflake.png',
  },
  {
    organization: 'Wells Fargo',
    position: 'Software Engineering Intern',
    date: 'Summer 2025',
    logo: '/images/companies/wellsfargo.png',
  },
  {
    organization: 'Jacobi Robotics',
    position: 'Product Manager Intern',
    date: 'Fall 2024',
    logo: '/images/companies/jacobi.png',
  },
  {
    organization: 'Nowadays AI',
    position: 'Software Engineering Intern',
    date: 'Summer 2024',
    logo: '/images/companies/nowadays.png',
  },
  {
    organization: 'Boeing',
    position: 'Program Management Intern',
    date: 'Summer 2023',
    logo: '/images/companies/boeing.png',
  },
]
