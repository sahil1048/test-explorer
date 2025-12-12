import { redirect } from 'next/navigation'

export default function CoursesPage() {
  // We don't want users seeing a raw list of all courses anymore.
  // Redirect them to the Categories (Streams) selection page instead.
  redirect('/categories')
}