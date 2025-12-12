import { createClient } from '@/lib/supabase/server'
import { updateSubjectAction } from '../../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

export default async function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  
  // 1. Fetch Subject
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .single()

  if (!subject) return notFound()

  // 2. Fetch Courses for dropdown
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/subjects" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Edit Subject: {subject.title}</h1>
        <form action={updateSubjectAction} className="space-y-6">
          <input type="hidden" name="id" value={subject.id} />
          
          {/* Course Dropdown */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Assign to Course</label>
            <div className="relative">
              <select 
                name="course_id" 
                defaultValue={subject.course_id}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer"
              >
                <option value="">Select a Course</option>
                {courses?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Subject Title</label>
            <input name="title" defaultValue={subject.title} type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" />
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}