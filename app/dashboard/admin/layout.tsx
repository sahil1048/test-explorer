import { requireDashboardRole } from '@/lib/auth/dashboard-guard'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardRole(['super_admin'])
  return children
}
