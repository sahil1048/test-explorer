'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { deleteStreamAction } from './actions'

export default function DeleteStreamButton({ streamId }: { streamId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const confirmDelete = async () => {
    setIsDeleting(true)
    const formData = new FormData()
    formData.append('id', streamId)

    const result = await deleteStreamAction(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Stream deleted successfully')
      setShowConfirm(false)
    }
    setIsDeleting(false)
  }

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete Stream?</h3>
              </div>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete this stream? This will remove all associated exams and content. <span className="font-bold text-red-600">This cannot be undone.</span>
            </p>

            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setShowConfirm(false)} disabled={isDeleting} className="px-4 py-2.5 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-100 disabled:opacity-70">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Yes, Delete Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}