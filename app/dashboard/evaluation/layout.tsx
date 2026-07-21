import { requireDashboardRole } from '@/lib/auth/dashboard-guard'

export default async function EvaluationLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardRole(['super_admin', 'school_admin', 'teacher'])
  return children
}
