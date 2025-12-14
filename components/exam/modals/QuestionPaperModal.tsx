import { X } from 'lucide-react'
import { Question } from '../types'

export const QuestionPaperModal = ({ questions, onClose }: { questions: Question[], onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] flex flex-col rounded shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 bg-gray-50/50">
           <h2 className="text-2xl font-normal text-black">Question Paper</h2>
           <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-black transition-colors">
             <X size={24} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-0">
           {questions.map((q, idx) => (
             <div key={q.id} className="border-b border-gray-300 py-6 last:border-0 first:pt-0">
                <div className="flex gap-3 text-black text-sm leading-relaxed">
                   <span className="font-bold whitespace-nowrap pt-0.5">Q.{idx + 1}:</span>
                   <div className="font-medium">
                     {/* Render direction if present */}
                     {q.direction && (
                       <div className="mb-2 italic text-gray-700 bg-gray-50 p-2 border-l-2 border-gray-300">
                         <span className="font-bold not-italic text-black text-xs block mb-1">Direction:</span>
                         {q.direction}
                       </div>
                     )}
                     {q.text}
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}