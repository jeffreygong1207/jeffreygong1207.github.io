import Crate from '@/components/staff/Crate'

// Auth, the Salon shell, the six fonts and the single screen-space grain all
// come from app/(staff)/admin/layout.tsx. Nothing here needs Supabase: the
// eleven projects are a static mirror in lib/projects.ts.
export const metadata = { title: 'Projects' }

export default function ProjectsPage() {
  return <Crate />
}
