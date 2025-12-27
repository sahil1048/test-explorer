'use client'

import { useState } from 'react'
import { FileText, Clock, Trophy, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { deleteMockTest, updateMockTest } from '@/app/dashboard/admin/mocktest/actions'
import { toast } from 'sonner'

interface MockTestCardProps {
  mock: {
    id: string
    title: string
    duration_minutes: number
    total_marks: number
    is_active: boolean
    created_at: string
    courses: {
      title: string
    } | null
    questions: {
      count: number
    }[]
  }
}

export default function MockTestCard({ mock }: MockTestCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this mock test? This action cannot be undone.')) return
    
    setIsLoading(true)
    try {
      await deleteMockTest(mock.id)
      toast.success('Mock test deleted successfully')
    } catch (error) {
      toast.error('Failed to delete mock test')
      setIsLoading(false)
    }
  }

  const handleUpdate = async (formData: FormData) => {
    setIsLoading(true)
    try {
      await updateMockTest(mock.id, formData)
      toast.success('Mock test updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update mock test')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}

      {isEditing ? (
        <form action={handleUpdate} className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex gap-1">
              <button type="submit" className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
              <input 
                name="title"
                defaultValue={mock.title}
                className="w-full text-sm font-bold text-gray-900 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Duration (Mins)</label>
              <input 
                name="duration"
                type="number"
                defaultValue={mock.duration_minutes}
                className="w-full text-sm font-medium text-gray-700 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-1"
              />
            </div>
          </div>
        </form>
      ) : (
        <>
          {/* Top Row */}
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            
            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Course */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {mock.title}
            </h3>
            <p className="text-xs text-gray-500 font-medium line-clamp-1 mb-4">
              {mock.courses?.title}
            </p>
          </div>

          {/* Stats Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3 mt-auto">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-1 rounded">
                <Clock className="w-3 h-3" /> {mock.duration_minutes}m
              </span>
              <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-1 rounded">
                <Trophy className="w-3 h-3" /> {mock.total_marks}
              </span>
            </div>
            <div className="font-bold text-gray-700">
              {mock.questions?.[0]?.count || 0} Qs
            </div>
          </div>
        </>
      )}
    </div>
  )
}