import { requireDashboardRole } from '@/lib/auth/dashboard-guard'

export default async function QuestionBankLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardRole(['super_admin', 'school_admin', 'teacher'])
  return children
}
