import { MailPlus, Presentation, UserCheck } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function TeachersPage() {
  return <FoundationPage eyebrow="People / Teachers" title="Teachers" description="Invite teaching staff and prepare grade, section, and subject assignments." action={{ label: 'Invite teachers', href: '/dashboard/onboarding?step=5' }} notice="Teacher invitations are part of the onboarding milestone. Assessment creation is intentionally not included in Phase 1." cards={[
    { title: 'No teachers yet', description: 'Invite the first teacher to start building your school team.', icon: Presentation, badge: 'Empty' },
    { title: 'Invitation lifecycle', description: 'Pending, accepted, expired, and revoked invitations will stay visible.', icon: MailPlus },
    { title: 'Academic assignments', description: 'Connect accepted teachers to grades, sections, and subjects.', icon: UserCheck },
  ]} />
}
