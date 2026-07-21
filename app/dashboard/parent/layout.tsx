import { requireDashboardRole } from '@/lib/auth/dashboard-guard'

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardRole(['parent', 'super_admin'])
  return children
}
