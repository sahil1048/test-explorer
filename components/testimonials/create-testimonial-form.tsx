'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { createTestimonialAction } from '@/app/dashboard/testimonials/actions'

export default function CreateTestimonialForm() {
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(event.currentTarget)
    const result = await createTestimonialAction(formData)
    
    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Testimonial added successfully!')
      // @ts-ignore
      event.target.reset()
    }
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Student Name</label>
        <input name="student_name" type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="Jane Doe" />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Class / Batch</label>
        <input name="course_name" type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="CUET 2024 Batch" />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Student Image URL (Optional)</label>
        <input name="student_image" type="text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="https://..." />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 mb-1">Review Message</label>
        <textarea name="message" required rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="This platform helped me score 99 percentile..." />
      </div>

      <button type="submit" disabled={isPending} className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Publish Testimonial
      </button>
    </form>
  )
}