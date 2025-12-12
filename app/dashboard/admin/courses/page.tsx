import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { deleteCourseAction } from './actions'

export default async function CoursesAdminPage() {
  const supabase = await createClient()
  const { data: courses } = await supabase.from('courses').select('*').order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900">Courses</h1>
        <Link href="/dashboard/admin/courses/new" className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800">
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </div>

      <div className="grid gap-4">
        {courses?.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-center group hover:border-black transition-all">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-gray-500 text-sm max-w-lg line-clamp-1">{course.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
               <Link href={`/dashboard/admin/courses/${course.id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                 <Pencil className="w-5 h-5" />
               </Link>
               <form action={deleteCourseAction}>
                 <input type="hidden" name="id" value={course.id} />
                 <button type="submit" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                   <Trash2 className="w-5 h-5" />
                 </button>
               </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}