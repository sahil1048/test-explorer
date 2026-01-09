import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditCourseForm from './edit-course-form'

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  
  // Fetch Course
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (!course) return notFound()

  // Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, title')
    .order('order_index')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/courses" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Edit Exam</h1>
        <EditCourseForm course={course} categories={categories || []} />
      </div>
    </div>
  )
}