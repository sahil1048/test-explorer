'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteQuestionAction, deleteAllQuestionsAction } from '../../actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog" // <--- Import Shadcn Component

interface Question {
  id: string
  text: string
  order_index: number
}

export default function QuestionsList({ 
  questions, 
  examId,
  examType
}: { 
  questions: Question[], 
  examId: string,
  examType: string
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500">
        No questions uploaded yet. Use the CSV uploader above to add some.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <h3 className="text-lg font-bold text-gray-900">Existing Questions</h3>
           <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
             {questions.length}
           </span>
        </div>

        {/* --- SHADCN ALERT DIALOG --- */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button 
              className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete All
            </button>
          </AlertDialogTrigger>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete ALL questions from this course.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault() // Prevent closing immediately to allow async action
                  setIsDeleting(true)
                  
                  const formData = new FormData()
                  formData.append('exam_id', examId)
                  formData.append('exam_type', examType)
                  
                  deleteAllQuestionsAction(formData).then((result) => {
                    if (result && 'error' in result) toast.error(result.error)
                    else toast.success('All questions deleted')
                    setIsDeleting(false)
                  })
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete All"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>

      <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
        {questions.map((q, index) => (
          <div key={q.id} className="group flex items-start justify-between gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200">
            <div className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-gray-50 text-gray-400 text-xs font-bold flex items-center justify-center rounded-full border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {index + 1}
              </span>
              <p className="text-sm text-gray-600 font-medium line-clamp-2 leading-relaxed group-hover:text-gray-900">
                {q.text}
              </p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData()
              formData.append('question_id', q.id)
              formData.append('exam_id', examId)
              const result = await deleteQuestionAction(formData)
              if (result && 'error' in result) toast.error(result.error)
              else toast.success('Question deleted')
            }}>
              <button 
                type="submit" 
                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}