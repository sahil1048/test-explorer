import { PanelsTopLeft, UserRoundCheck, Users } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function SectionsPage() {
  return <FoundationPage eyebrow="Academics / Sections" title="Sections" description="Create sections within a grade and academic year, then connect students and teachers." action={{ label: 'Create sections', href: '/dashboard/onboarding?step=4' }} cards={[
    { title: 'No sections yet', description: 'Choose an academic year and grade to create the first section.', icon: PanelsTopLeft, badge: 'Empty' },
    { title: 'Student rosters', description: 'Section membership will become the primary way to organize students.', icon: Users },
    { title: 'Homeroom teachers', description: 'Assign a primary teacher while keeping subject assignments flexible.', icon: UserRoundCheck },
  ]} />
}
