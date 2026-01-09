'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createAnnouncementAction } from './actions'

export default function CreateAnnouncementForm() {
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    const formData = new FormData(event.currentTarget)
    const result = await createAnnouncementAction(formData)

    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Announcement posted successfully')
      event.currentTarget.reset()
    }
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Headline</label>
        <input name="title" required placeholder="e.g. Exam Schedule Released" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm font-medium" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Content</label>
        <textarea name="content" required rows={4} placeholder="Details about the announcement..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm font-medium resize-none" />
      </div>
      <button type="submit" disabled={isPending} className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all text-sm disabled:opacity-70">
        {isPending ? 'Posting...' : 'Post Announcement'}
      </button>
    </form>
  )
}