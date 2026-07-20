import { GraduationCap, ListOrdered, Sparkles } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function GradesPage() {
  return <FoundationPage eyebrow="Academics / Grades" title="Grades" description="Create grade levels once, order them naturally, and reuse them across academic years." action={{ label: 'Create grades', href: '/dashboard/onboarding?step=3' }} cards={[
    { title: 'No grades yet', description: 'Add the grade levels your school currently teaches.', icon: GraduationCap, badge: 'Empty' },
    { title: 'Natural ordering', description: 'Keep grades in the sequence your school uses.', icon: ListOrdered },
    { title: 'Promotion ready', description: 'Grade definitions stay stable while student assignments move each year.', icon: Sparkles },
  ]} />
}
