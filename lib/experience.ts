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
   * Undefined on every role today. Inventing copy for someone else's
   * employment history is not a thing a design pass gets to do, so the slate
   * renders nothing at all when this is absent — no badge, no slug.
   */
  description?: string
  /** Same: a role becomes a link, and focusable, only once this is set. */
  url?: string
}

/** Newest first, exactly as ordered in `components/Experience.tsx`. */
export const EXPERIENCE_ROLES: ExperienceRole[] = [
  {
    organization: 'Stripe',
    position: 'Software Engineering Intern',
    date: 'Summer 2026',
  },
  {
    organization: 'Snowflake',
    position: 'Software Engineering Intern',
    date: 'Fall 2025',
  },
  {
    organization: 'Wells Fargo',
    position: 'Software Engineering Intern',
    date: 'Summer 2025',
  },
  {
    organization: 'Jacobi Robotics',
    position: 'Product Manager Intern',
    date: 'Fall 2024',
  },
  {
    organization: 'Nowadays AI',
    position: 'Software Engineering Intern',
    date: 'Summer 2024',
  },
  {
    organization: 'Boeing',
    position: 'Program Management Intern',
    date: 'Summer 2023',
  },
]
