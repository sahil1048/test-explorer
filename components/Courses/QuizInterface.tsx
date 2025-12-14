'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type Option = { id: string; text: string; is_correct: boolean }
type Question = { id: string; text: string; explanation: string | null; options: Option[] }

export default function QuizInterface({ questions }: { questions: Question[] }) {
  // --- STATE ---
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [explanationsOpen, setExplanationsOpen] = useState<Record<string, boolean>>({})
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // --- LOGIC ---
  const totalPages = Math.ceil(questions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentQuestions = questions.slice(startIndex, startIndex + itemsPerPage)

  const handleSelect = (questionId: string, optionId: string) => {
    if (selections[questionId]) return 
    setSelections(prev => ({ ...prev, [questionId]: optionId }))
  }

  const toggleExplanation = (questionId: string) => {
    setExplanationsOpen(prev => ({ ...prev, [questionId]: !prev[questionId] }))
  }

  // Scroll to top when changing pages
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* QUESTIONS LIST */}
      <div className="space-y-8 min-h-[600px]">
        {currentQuestions.map((q, index) => {
          const selectedOptId = selections[q.id]
          const isAnswered = !!selectedOptId
          // Calculate actual question number across pages
          const actualQuestionNumber = startIndex + index + 1

          return (
            <div key={q.id} className="bg-white rounded-3xl border-2 border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Question Header */}
              <div className="flex gap-4 mb-6">
                <div className="shrink-0 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-blue-200 shadow-lg">
                  {actualQuestionNumber}
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-relaxed pt-1">
                  {q.text}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="space-y-3 pl-0 md:pl-14">
                {q.options.map((opt) => {
                  const isSelected = selectedOptId === opt.id
                  
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
                       cardStyle = "border-green-500 border-dashed bg-white" 
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

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="pt-8 pb-12">
          <Pagination>
            <PaginationContent>
              
              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) handlePageChange(currentPage - 1)
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1
                return (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#"
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(page)
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) handlePageChange(currentPage + 1)
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}