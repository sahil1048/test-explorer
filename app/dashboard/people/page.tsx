import { Presentation, ShieldCheck, UserRound, Users } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function PeoplePage() {
  return <FoundationPage eyebrow="People" title="Everyone in your school" description="Manage school admins, teachers, and students from one role-aware directory." cards={[
    { title: 'Teachers', description: 'Invite teachers and connect them to grades, sections, and subjects.', href: '/dashboard/people/teachers', icon: Presentation },
    { title: 'Students', description: 'Manage student status and academic assignments.', href: '/dashboard/people/students', icon: Users },
    { title: 'School Admins', description: 'Manage organization administrators and their activity.', icon: ShieldCheck, badge: 'Soon' },
    { title: 'Parents', description: 'Reserved for a future parent experience.', icon: UserRound, badge: 'Future' },
  ]} />
}
