'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

type Option = { id: string; text: string; is_correct: boolean }
type Question = { id: string; text: string; explanation: string | null; options: Option[] }

export default function QuizInterface({ questions }: { questions: Question[] }) {
  // State to track selected option for each question
  const [selections, setSelections] = useState<Record<string, string>>({})
  // State to track which explanations are open
  const [explanationsOpen, setExplanationsOpen] = useState<Record<string, boolean>>({})

  const handleSelect = (questionId: string, optionId: string) => {
    // Prevent changing answer once selected (optional, remove check to allow changing)
    if (selections[questionId]) return 

    setSelections(prev => ({ ...prev, [questionId]: optionId }))
  }

  const toggleExplanation = (questionId: string) => {
    setExplanationsOpen(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {questions.map((q, index) => {
        const selectedOptId = selections[q.id]
        const isAnswered = !!selectedOptId
        const isCorrect = q.options.find(o => o.id === selectedOptId)?.is_correct

        return (
          <div key={q.id} className="bg-white rounded-3xl border-2 border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            
            {/* Question Header */}
            <div className="flex gap-4 mb-6">
              <div className="shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-blue-200 shadow-lg">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-900 leading-relaxed pt-1">
                {q.text}
              </h3>
            </div>

            {/* Options Grid */}
            <div className="space-y-3 pl-0 md:pl-14">
              {q.options.map((opt) => {
                const isSelected = selectedOptId === opt.id
                // Logic for styling:
                // 1. If this option is selected AND correct -> Green
                // 2. If this option is selected AND wrong -> Red
                // 3. If answered, and this is the correct option (show it even if user picked wrong) -> Green Border
                
                let cardStyle = "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                let icon = <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-gray-500" />
                
                if (isAnswered) {
                  if (isSelected && opt.is_correct) {
                     cardStyle = "border-green-500 bg-green-50 ring-1 ring-green-500"
                     icon = <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-100" />
                  } else if (isSelected && !opt.is_correct) {
                     cardStyle = "border-red-500 bg-red-50 ring-1 ring-red-500"
                     icon = <XCircle className="w-6 h-6 text-red-600 fill-red-100" />
                  } else if (!isSelected && opt.is_correct) {
                     cardStyle = "border-green-500 border-dashed bg-white" // Show correct answer nicely
                     icon = <CheckCircle2 className="w-6 h-6 text-green-500 opacity-50" />
                  } else {
                     cardStyle = "border-gray-100 opacity-50 cursor-not-allowed"
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(q.id, opt.id)}
                    disabled={isAnswered}
                    className={`
                      group w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${cardStyle}
                    `}
                  >
                    <div className="shrink-0">{icon}</div>
                    <span className={`font-medium ${isSelected ? 'text-black' : 'text-gray-600'}`}>
                      {opt.text}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Explanation Toggle */}
            <div className="mt-6 pl-0 md:pl-14">
              <button 
                onClick={() => toggleExplanation(q.id)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
              >
                {explanationsOpen[q.id] ? "Hide Explanation" : "Show Explanation"}
                {explanationsOpen[q.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Explanation Content */}
              {explanationsOpen[q.id] && (
                <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200 text-gray-700 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold uppercase tracking-wider text-xs">
                    <HelpCircle className="w-4 h-4" /> Explanation
                  </div>
                  {q.explanation || "No explanation provided for this question."}
                </div>
              )}
            </div>

          </div>
        )
      })}
    </div>
  )
}