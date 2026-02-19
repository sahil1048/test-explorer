'use client'

import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { deleteTestimonialAction } from '@/app/dashboard/testimonials/actions'

export default function DeleteTestimonialButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    
    setIsPending(true)
    const formData = new FormData()
    formData.append('id', id)
    
    const result = await deleteTestimonialAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Testimonial deleted')
    }
    setIsPending(false)
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
