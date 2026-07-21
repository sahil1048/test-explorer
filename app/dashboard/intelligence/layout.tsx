import { requireDashboardRole } from '@/lib/auth/dashboard-guard'

export default async function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardRole(['super_admin', 'school_admin'])
  return children
}
