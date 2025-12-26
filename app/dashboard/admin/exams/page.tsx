import { createClient } from '@/lib/supabase/server'
import ExamsClient from './exams-client'

export default async function ExamsAdminPage() {
  const supabase = await createClient()

  // Fetch Full Hierarchy: 
  // Streams -> Courses -> Subjects -> (Prep, Mock, Practice)
  // Note: We are fetching ALL content types nested under subjects.
  const { data: streams } = await supabase
    .from('categories')
    .select(`
      id, 
      title,
      courses (
        id, 
        title,
        subjects (
          id, 
          title,
          prep_modules (id, title, is_published, created_at),
          practice_tests (id, title, is_published, created_at),
          exams (id, title, is_published, created_at, category)
        )
      )
    `)
    .order('order_index', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Content Library</h1>
        <p className="text-gray-500">Manage Prep Modules, Practice Tests, and Mock Exams organized by stream.</p>
      </div>

      {/* @ts-ignore - Supabase types can be deep and tricky */}
      <ExamsClient streams={streams || []} />
    </div>
  )
}