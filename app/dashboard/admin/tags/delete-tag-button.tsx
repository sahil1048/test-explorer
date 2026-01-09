'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteTagAction } from './actions'

export default function DeleteTagButton({ tagId }: { tagId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    setIsDeleting(true)
    const formData = new FormData()
    formData.append('id', tagId)

    const result = await deleteTagAction(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Tag deleted successfully')
    }
    setIsDeleting(false)
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}