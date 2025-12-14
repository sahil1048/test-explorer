'use client'

import { Trash2 } from 'lucide-react'
import { deleteBlogAction } from '@/app/dashboard/admin/blogs/actions'
import { toast } from 'sonner'

export default function DeleteBlogButton({ blogId }: { blogId: string }) {
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm('Are you sure you want to delete this blog?')) return

    // We can call the server action directly here
    const formData = new FormData()
    formData.append('id', blogId)
    
    try {
      await deleteBlogAction(formData)
      toast.success('Blog deleted successfully')
    } catch (error) {
      toast.error('Failed to delete blog')
    }
  }

  return (
    <form onSubmit={handleDelete}>
      <button 
        type="submit" 
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete Blog"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  )
}