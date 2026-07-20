import { BookOpen, LibraryBig, UsersRound } from 'lucide-react'
import FoundationPage from '@/components/dashboard/foundation-page'

export default function SubjectsPage() {
  return <FoundationPage eyebrow="Academics / Subjects" title="Subjects" description="Maintain your school subject catalog independently from the legacy competitive-exam catalog." cards={[
    { title: 'No school subjects yet', description: 'Create subjects such as Mathematics, Science, English, or Art.', icon: BookOpen, badge: 'Empty' },
    { title: 'Section offerings', description: 'Choose which subjects are taught in each section.', icon: LibraryBig },
    { title: 'Teacher assignments', description: 'Connect subject teachers after staff invitations are accepted.', icon: UsersRound },
  ]} />
}
