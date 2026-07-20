import { Archive, CalendarCheck, CalendarPlus } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function AcademicYearsPage() {
  return <FoundationPage eyebrow="Academics / Academic Years" title="Academic years" description="Create the timeline for your school. One year can be current while future and archived years remain available." action={{ label: 'Set up academic year', href: '/dashboard/onboarding?step=2' }} notice="Academic year management is being introduced incrementally. The Phase 1 database supports current, future, and archived years without deleting history." cards={[
    { title: 'Current year', description: 'The active year will appear here after onboarding.', icon: CalendarCheck, badge: 'Empty' },
    { title: 'Future years', description: 'Prepare next year before promotion begins.', icon: CalendarPlus, badge: 'Empty' },
    { title: 'Archive', description: 'Completed years stay available as read-only history.', icon: Archive, badge: 'Empty' },
  ]} />
}
