import { createClient } from '@/lib/supabase/server'
import { createCourseAction } from '../actions'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

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
        <ArrowLeft className="w-4 h-4" /> Back to Courses
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Create New Course</h1>
        <form action={createCourseAction} className="space-y-6">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Stream / Category</label>
            <div className="relative">
              <select 
                name="category_id" 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer"
              >
                <option value="">Select a Stream</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              {/* Custom Arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Course Title</label>
            <input name="title" type="text" placeholder="e.g. JEE Main 2025" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
            <textarea name="description" rows={3} placeholder="Course details..." className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div className="flex items-center gap-3">
             <input type="checkbox" name="is_published" id="pub" className="w-5 h-5 accent-black" />
             <label htmlFor="pub" className="text-sm font-medium text-gray-700">Publish immediately</label>
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Create Course
          </button>
        </form>
      </div>
    </div>
  )
}