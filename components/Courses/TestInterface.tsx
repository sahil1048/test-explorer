'use client'

import { useState, useEffect } from 'react'
import { submitExamAction } from '../../app/courses/[courseId]/subjects/[subjectId]/test/[testType]/[examId]/actions'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Bookmark, 
  X,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TestInterface({ 
  exam, 
  questions,
  courseId,
  subjectId,
  testType // 'practice' | 'mock'
}: { 
  exam: any, 
  questions: any[],
  courseId: string,
  subjectId: string,
  testType: string
}) {
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState((exam.duration_minutes || 60) * 60) 
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- CRITICAL FIX ---
  // If no questions exist, show a safe fallback UI immediately
  if (!questions || questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Found</h2>
          <p className="text-gray-500">This test has no questions yet.</p>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQIndex]
  // --------------------

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const timeTaken = ((exam.duration_minutes || 60) * 60) - timeLeft
    try {
      await submitExamAction(exam.id, courseId, subjectId, answers, timeTaken, testType)
    } catch (err) {
      alert("Submission failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] font-sans">
      
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#6366F1] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-indigo-200 shadow-lg">
            {currentQIndex + 1}
          </div>
          <h1 className="font-bold text-gray-800 text-lg hidden md:block">{exam.title}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-mono font-bold text-lg text-gray-700">
            <Clock className="w-5 h-5 text-gray-400" />
            {formatTime(timeLeft)}
          </div>
          <Button 
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 font-bold rounded-lg shadow-lg shadow-indigo-200"
          >
            Submit Test
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Question Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex-1 relative">
              
              <button 
                onClick={() => setMarkedForReview(prev => prev.includes(currentQ.id) ? prev.filter(id => id !== currentQ.id) : [...prev, currentQ.id])}
                className="absolute top-8 right-8 text-gray-300 hover:text-[#6366F1] transition-colors"
              >
                <Bookmark className={`w-8 h-8 ${markedForReview.includes(currentQ.id) ? 'fill-[#6366F1] text-[#6366F1]' : ''}`} />
              </button>

              <div className="mb-8 pr-12">
                <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed">
                  {currentQ?.text}
                </p>
              </div>

              <div className="space-y-4">
                {currentQ?.options?.map((opt: any, idx: number) => {
                  const isSelected = answers[currentQ.id] === opt.id
                  const labels = ['A', 'B', 'C', 'D']
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }))}
                      className={`
                        w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group
                        ${isSelected 
                          ? 'border-[#6366F1] bg-indigo-50 shadow-inner' 
                          : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-colors
                        ${isSelected ? 'bg-[#6366F1] border-[#6366F1] text-white' : 'bg-white border-gray-200 text-gray-500 group-hover:border-gray-400'}
                      `}>
                        {labels[idx] || idx + 1}
                      </div>
                      <span className={`text-lg ${isSelected ? 'text-[#6366F1] font-semibold' : 'text-gray-600'}`}>
                        {opt.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button 
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="px-6 py-3 rounded-xl font-bold text-[#6366F1] bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Previous
              </button>
              
              <button 
                onClick={() => {
                  if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1)
                  else setIsSubmitModalOpen(true)
                }}
                className="flex items-center gap-2 px-8 py-3 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5] shadow-lg shadow-indigo-200 transition-all"
              >
                {currentQIndex === questions.length - 1 ? 'Finish' : 'Next'} 
              </button>
            </div>

          </div>
        </main>

        {/* Right Sidebar: Palette */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6 hidden lg:flex flex-col shadow-sm z-10">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="font-bold text-gray-700">{formatTime(timeLeft)}</span>
          </div>

          <div className="grid grid-cols-4 gap-3 content-start">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]
              const isReview = markedForReview.includes(q.id)
              const isCurrent = idx === currentQIndex
              
              let style = "bg-white text-gray-500 border-gray-100"
              if (isCurrent) style = "bg-[#6366F1] text-white border-[#6366F1] ring-4 ring-indigo-100"
              else if (isReview) style = "bg-purple-100 text-purple-700 border-purple-200"
              else if (isAnswered) style = "bg-indigo-50 text-[#6366F1] border-indigo-200 font-bold"

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`
                    w-full aspect-square rounded-xl border-2 flex items-center justify-center text-sm font-medium transition-all
                    ${style}
                  `}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-auto">
            <Button onClick={handleSubmit} className="w-full bg-[#6366F1] hover:bg-[#4F46E5]">Submit Test</Button>
          </div>
        </aside>
      </div>

      {/* --- SUBMIT MODAL --- */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-gray-100 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-900">Finish Test?</h2>
              <button onClick={() => setIsSubmitModalOpen(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-black" />
              </button>
            </div>
            
            <div className="h-px bg-gray-100 my-4" />
            
            <p className="text-gray-600 mb-4 text-sm">
              Are you sure you want to finish this test?
            </p>
            
            <p className="text-gray-800 font-medium mb-1 text-sm">
              Time is running out! <span className="text-red-500">Only {formatTime(timeLeft)} left.</span>
            </p>
            <p className="text-gray-500 text-xs mb-8">
              You will be unable to resume after you finish this test.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3 bg-[#FF6B6B] text-white font-bold rounded-lg hover:bg-[#FF5252] transition-colors shadow-lg shadow-red-100"
              >
                Continue Exam
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#6366F1] text-white font-bold rounded-lg hover:bg-[#4F46E5] transition-colors shadow-lg shadow-indigo-100"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}