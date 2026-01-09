import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CourseForm from './course-form'

export default async function NewCoursePage() {
  const supabase = await createClient()

  // Fetch Categories for the dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, title')
    .order('order_index')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/courses" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Exams
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Create New Exams</h1>
        <CourseForm categories={categories || []} />
      </div>
    </div>
  )
}