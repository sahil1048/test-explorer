import { createClient } from '@/lib/supabase/server'
import { updateCourseAction } from '../../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

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
        <h1 className="text-2xl font-black text-gray-900 mb-6">Edit Course</h1>
        <form action={updateCourseAction} className="space-y-6">
          <input type="hidden" name="id" value={course.id} />
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Stream / Category</label>
            <div className="relative">
              <select 
                name="category_id" 
                defaultValue={course.category_id || ""}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer"
              >
                <option value="">Select a Stream</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
            <input name="title" defaultValue={course.title} type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
            <textarea name="description" defaultValue={course.description} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div className="flex items-center gap-3">
             <input type="checkbox" name="is_published" id="pub" defaultChecked={course.is_published} className="w-5 h-5 accent-black" />
             <label htmlFor="pub" className="text-sm font-medium text-gray-700">Published</label>
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2">
             <Save className="w-4 h-4" /> Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}