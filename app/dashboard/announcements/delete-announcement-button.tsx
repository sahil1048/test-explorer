'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteAnnouncementAction } from './actions'

export default function DeleteAnnouncementButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    setIsDeleting(true)
    const formData = new FormData()
    formData.append('id', id)

    const result = await deleteAnnouncementAction(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Announcement deleted successfully')
    }
    setIsDeleting(false)
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}