import { Bell, CalendarDays, Megaphone } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function CommunicationPage() {
  return <FoundationPage eyebrow="Communication" title="School communication" description="Keep operational communication close to the people and academic structure it affects." cards={[
    { title: 'Announcements', description: 'Create and manage school-wide updates.', href: '/dashboard/communication/announcements', icon: Megaphone },
    { title: 'Notifications', description: 'The notification center is ready for future events.', icon: Bell, badge: 'Infrastructure' },
    { title: 'Upcoming events', description: 'Calendar-based school events are planned for a later milestone.', icon: CalendarDays, badge: 'Soon' },
  ]} />
}
