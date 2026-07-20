import { ChartNoAxesCombined, SearchCheck, TrendingUp } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function AnalyticsPlaceholderPage() {
  return <FoundationPage eyebrow="Analytics" title="Analytics without invented numbers" description="This page stays intentionally empty until real assessment and learning data exists." notice="No placeholder performance percentages or rankings will be displayed. Future insights will always identify their period, population, and source." cards={[
    { title: 'Academic health', description: 'Real grade, section, and subject trends will appear here later.', icon: TrendingUp, badge: 'Placeholder' },
    { title: 'Learning gaps', description: 'Topic and outcome mastery will require real assessment evidence.', icon: SearchCheck, badge: 'Placeholder' },
    { title: 'Decision-ready reports', description: 'Every metric will support a drill-down and next action.', icon: ChartNoAxesCombined, badge: 'Placeholder' },
  ]} />
}
