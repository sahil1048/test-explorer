import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditSubjectForm from '@/components/admin/edit-subject-form' // Import the new component

export default async function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  
  // 1. Fetch Subject AND its related Course (to get the category_id/stream)
  const { data: subject } = await supabase
    .from('subjects')
    .select('*, courses(category_id)')
    .eq('id', id)
    .single()

  if (!subject) return notFound()

  // 2. Fetch all Streams
  const { data: streams } = await supabase
    .from('categories')
    .select('id, title')
    .order('title')

  // 3. Fetch all Courses with category_id
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, category_id')
    .order('title')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/subjects" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Edit Subject: {subject.title}</h1>
        
        {/* Pass data to Client Form */}
        <EditSubjectForm 
          // @ts-ignore - Supabase type inference for joined tables can be tricky
          subject={subject}
          streams={streams || []}
          courses={courses || []}
        />
      </div>
    </div>
  )
}