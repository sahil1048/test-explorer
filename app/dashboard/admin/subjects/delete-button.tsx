'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSubjectAction } from './actions'

interface DeleteSubjectButtonProps {
  id: string
  title: string
}

export default function DeleteSubjectButton({ id, title }: DeleteSubjectButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    // 1. Show loading toast
    const toastId = toast.loading('Deleting subject and cleaning up data...')
    setIsDeleting(true)
    
    try {
      const formData = new FormData()
      formData.append('id', id)

      // 2. Call Server Action
      const result = await deleteSubjectAction(formData)

      if (result && 'error' in result) {
        // Handle Error
        toast.dismiss(toastId)
        toast.error(result.error)
      } else {
        // Handle Success
        toast.dismiss(toastId)
        toast.success('Subject deleted successfully')
        setShowConfirm(false)
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error('An unexpected error occurred.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete Subject"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete Subject?</h3>
              </div>
              <button 
                onClick={() => setShowConfirm(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-900">{title}</span>? 
              <br/><br/>
              This will permanently remove all associated <span className="font-bold text-red-600">Practice Tests, Mock Tests, and Questions</span>. 
              This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button 
                onClick={() => setShowConfirm(false)} 
                disabled={isDeleting} 
                className="px-4 py-2.5 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting} 
                className="px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-100 disabled:opacity-70"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Yes, Delete Subject
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}