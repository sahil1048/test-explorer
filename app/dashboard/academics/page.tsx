import { BookOpen, CalendarRange, GraduationCap, PanelsTopLeft } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function AcademicsPage() {
  return <FoundationPage eyebrow="Academics" title="Your school structure" description="Organize the academic foundation that teachers, students, assessments, and analytics will share." action={{ label: 'Continue school setup', href: '/dashboard/onboarding' }} cards={[
    { title: 'Academic Years', description: 'Manage current, future, and archived school years.', href: '/dashboard/academics/academic-years', icon: CalendarRange },
    { title: 'Grades', description: 'Create the grade levels used throughout your school.', href: '/dashboard/academics/grades', icon: GraduationCap },
    { title: 'Sections', description: 'Organize students into grade sections for each academic year.', href: '/dashboard/academics/sections', icon: PanelsTopLeft },
    { title: 'Subjects', description: 'Build the school subject catalog and connect it to sections.', href: '/dashboard/academics/subjects', icon: BookOpen },
  ]} />
}
