import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CreateSubjectForm from '@/components/admin/create-subject-form' // Import the new component

export default async function NewSubjectPage() {
  const supabase = await createClient()

  // 1. Fetch Streams (Categories)
  const { data: streams } = await supabase
    .from('categories')
    .select('id, title')
    .order('title')

  // 2. Fetch Courses (Exams) with their category_id
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, category_id') // Important: Fetch category_id for filtering
    .order('title')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/subjects" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Add New Subject</h1>
        
        {/* Pass data to the Client Component */}
        <CreateSubjectForm 
          streams={streams || []} 
          courses={courses || []} 
        />
        
      </div>
    </div>
  )
}