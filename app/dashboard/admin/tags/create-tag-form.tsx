'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { createTagAction } from './actions'

export default function CreateTagForm() {
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    const formData = new FormData(event.currentTarget)
    const result = await createTagAction(formData)

    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Tag created successfully')
      event.currentTarget.reset()
    }
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4">
      <input 
        name="name" 
        type="text" 
        required
        placeholder="e.g. Technology, Exams, News"
        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
      />
      <button 
        type="submit" 
        disabled={isPending}
        className="bg-black text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-70"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Add
      </button>
    </form>
  )
}