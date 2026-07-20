import { CalendarClock, ClipboardCheck, Sparkles } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function AssessmentsPlaceholderPage() {
  return <FoundationPage eyebrow="Assessments" title="Assessments are coming next" description="This area will use the organization, academic structure, people, and permissions established in Phase 1." notice="Assessment creation, question banks, delivery, and grading are intentionally outside this phase." cards={[
    { title: 'Assessment workspace', description: 'Create, schedule, and assign school assessments in a future phase.', icon: ClipboardCheck, badge: 'Placeholder' },
    { title: 'Academic calendar', description: 'See assessment windows alongside school events.', icon: CalendarClock, badge: 'Placeholder' },
    { title: 'Teacher workflow', description: 'A focused authoring and assignment experience will build on this foundation.', icon: Sparkles, badge: 'Placeholder' },
  ]} />
}
