'use client'

import { Trash2, AlertCircle } from 'lucide-react'
import { deleteQuestionAction } from '../../actions'

interface Question {
  id: string
  text: string
  order_index: number
}

export default function QuestionsList({ 
  questions, 
  examId 
}: { 
  questions: Question[], 
  examId: string 
}) {
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
        <h3 className="text-lg font-bold text-gray-900">Existing Questions ({questions.length})</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Auto-sorted by CSV order
        </span>
      </div>

      <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 border border-gray-100 rounded-xl p-2">
        {questions.map((q, index) => (
          <div key={q.id} className="group flex items-start justify-between gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-red-100 hover:shadow-sm transition-all">
            <div className="flex gap-3">
              <span className="shrink-0 w-6 h-6 bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center rounded-full">
                {index + 1}
              </span>
              <p className="text-sm text-gray-700 font-medium line-clamp-2 leading-relaxed">
                {q.text}
              </p>
            </div>

            <form action={deleteQuestionAction}>
              <input type="hidden" name="question_id" value={q.id} />
              <input type="hidden" name="exam_id" value={examId} />
              <button 
                type="submit" 
                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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