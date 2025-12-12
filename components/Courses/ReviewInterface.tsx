'use client'

import { useState } from 'react'
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  ListTodo,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

type Option = { id: string; text: string; is_correct: boolean }
type Question = { id: string; text: string; explanation: string | null; options: Option[] }

interface ReviewInterfaceProps {
  examTitle: string
  questions: Question[]
  userAnswers: Record<string, string>
  backLink: string
}

export default function ReviewInterface({ 
  examTitle, 
  questions, 
  userAnswers,
  backLink 
}: ReviewInterfaceProps) {
  const [currentQIndex, setCurrentQIndex] = useState(0)
  
  const currentQ = questions[currentQIndex]
  const userSelectedOptionId = userAnswers[currentQ.id]
  const isSkipped = !userSelectedOptionId
  
  // Determine status for Palette
  const getQuestionStatus = (q: Question) => {
    const selected = userAnswers[q.id]
    if (!selected) return 'skipped'
    const correct = q.options.find(o => o.is_correct)?.id
    return selected === correct ? 'correct' : 'wrong'
  }

  return (
    <div className="flex flex-col h-screen bg-[#FDF8F6] font-sans text-gray-900">
      
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href={backLink} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="font-bold text-gray-800 text-lg line-clamp-1">Review: {examTitle}</h1>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-lg">
            <CheckCircle2 className="w-4 h-4" /> Correct
          </span>
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-lg">
            <XCircle className="w-4 h-4" /> Wrong
          </span>
          <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
            <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div> Skipped
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Question Card */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-200 shadow-sm relative overflow-hidden">
              
              {/* Status Badge */}
              <div className={`
                absolute top-0 right-0 px-6 py-2 rounded-bl-2xl font-bold text-xs uppercase tracking-widest
                ${isSkipped ? 'bg-gray-100 text-gray-500' : 
                  getQuestionStatus(currentQ) === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
              `}>
                {isSkipped ? 'Not Attempted' : getQuestionStatus(currentQ) === 'correct' ? 'Correct Answer' : 'Incorrect Answer'}
              </div>

              <div className="flex gap-4 mb-8">
                <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg">
                  {currentQIndex + 1}
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mt-1">
                  {currentQ.text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = userSelectedOptionId === opt.id
                  const isCorrect = opt.is_correct
                  
                  let style = "border-gray-200 bg-white text-gray-600"
                  let icon = <div className="w-5 h-5 rounded-full border-2 border-gray-300" />

                  // Logic for styling review options
                  if (isCorrect) {
                    style = "border-green-500 bg-green-50 text-green-900 ring-1 ring-green-500"
                    icon = <CheckCircle2 className="w-5 h-5 text-green-600 fill-green-100" />
                  } else if (isSelected && !isCorrect) {
                    style = "border-red-500 bg-red-50 text-red-900 ring-1 ring-red-500"
                    icon = <XCircle className="w-5 h-5 text-red-600 fill-red-100" />
                  } else if (isSelected) {
                     // Selected but implicitly covered by 'isCorrect' above, 
                     // essentially this case shouldn't be hit visually if logic is right, 
                     // but good for fallback
                     style = "border-gray-900 bg-gray-50"
                  } else {
                     style = "opacity-60" // Dim non-selected, wrong answers
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`
                        w-full text-left p-4 rounded-xl border-2 flex items-center gap-4 transition-all
                        ${style}
                      `}
                    >
                      <div className="flex-shrink-0">{icon}</div>
                      <span className="font-medium text-lg">{opt.text}</span>
                      {isSelected && !isCorrect && (
                        <span className="ml-auto text-xs font-bold uppercase text-red-500 tracking-wider">Your Answer</span>
                      )}
                      {isCorrect && (
                        <span className="ml-auto text-xs font-bold uppercase text-green-600 tracking-wider">Correct Answer</span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Explanation Box */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold uppercase tracking-wider text-xs">
                    <HelpCircle className="w-4 h-4" /> Explanation
                  </div>
                  <div className="text-gray-700 leading-relaxed text-sm">
                    {currentQ.explanation ? (
                      currentQ.explanation
                    ) : (
                      <span className="italic text-gray-400">No detailed explanation available for this question.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <button 
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:border-black hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
              
              <button 
                onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQIndex === questions.length - 1}
                className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:border-black hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </main>

        {/* Right Panel: Question Map */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6 hidden xl:flex flex-col shadow-sm z-10">
          <div className="flex items-center gap-2 mb-6 text-gray-400 font-bold text-xs uppercase tracking-widest">
            <ListTodo className="w-4 h-4" /> Question Map
          </div>

          <div className="grid grid-cols-4 gap-3 content-start ">
            {questions.map((q, idx) => {
              const status = getQuestionStatus(q)
              const isCurrent = idx === currentQIndex
              
              let style = "bg-gray-50 text-gray-400 border-transparent"
              
              if (status === 'correct') style = "bg-green-100 text-green-700 border-green-200"
              else if (status === 'wrong') style = "bg-red-100 text-red-700 border-red-200"
              
              if (isCurrent) style += " ring-2 ring-offset-2 ring-black border-black"

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`
                    w-full aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-bold transition-all
                    ${style}
                  `}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </aside>

      </div>
    </div>
  )
}