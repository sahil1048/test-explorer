'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'
import { updateCourseAction } from '../../actions'

export default function EditCourseForm({ course, categories }: { course: any, categories: any[] }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(event.currentTarget)
    const result = await updateCourseAction(formData)
    
    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Course updated successfully')
      router.push('/dashboard/admin/courses')
      router.refresh()
    }
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <label className="block text-sm font-bold text-gray-900 mb-2">Exam Title</label>
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

      <button type="submit" disabled={isPending} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-70">
         {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
         Save Changes
      </button>
    </form>
  )
}