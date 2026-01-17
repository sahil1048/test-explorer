'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteMockTestsAction } from '@/app/dashboard/admin/mocktest/actions' // Ensure this path is correct
import { toast } from 'sonner'

interface DeleteCategoryButtonProps {
  mockIds: string[]
  categoryName: string
}

export default function DeleteCategoryButton({ mockIds, categoryName }: DeleteCategoryButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${mockIds.length} mock tests in "${categoryName}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    startTransition(async () => {
      const result = await deleteMockTestsAction(mockIds)
      
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Deleted ${mockIds.length} mock tests`)
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending || mockIds.length === 0}
      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete All Tests in this Category"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">{isPending ? 'Deleting...' : 'Delete All'}</span>
    </button>
  )
}