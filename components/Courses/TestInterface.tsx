'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Bookmark, 
  X,
  AlertCircle,
  CheckCircle2,
  ListTodo
} from 'lucide-react'
import { toast } from 'sonner'

type Option = { id: string; text: string }
type Question = { id: string; text: string; options: Option[] }

interface TestInterfaceProps {
  exam: any
  questions: Question[]
  courseId: string
  subjectId: string
  testType: string
  // We pass the action as a prop to avoid import path issues
  submitAction: (answers: Record<string, string>, timeTaken: number) => Promise<{ error?: string; success?: boolean; redirectUrl?: string }>
}

export default function TestInterface({ 
  exam, 
  questions, 
  submitAction 
}: TestInterfaceProps) {
  const router = useRouter()
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState((exam.duration_minutes || 60) * 60) 
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- SAFEGUARDS ---
  if (!questions || questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F3F4F6]">
        <div className="bg-white p-10 rounded-3xl border-2 border-dashed border-gray-300 text-center">
          <p className="text-xl font-bold text-gray-400">No questions available.</p>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQIndex]

  // --- TIMER ---
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

  // --- HANDLERS ---
  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const timeTaken = ((exam.duration_minutes || 60) * 60) - timeLeft
    
    try {
      // 1. Call Action
      const result = await submitAction(answers, timeTaken)
      
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      if (result?.success) {
        toast.success("Test submitted successfully!")
        if (result.redirectUrl) {
          router.push(result.redirectUrl)
        }
      } else {
        toast.error("Invalid response from server")
        setIsSubmitting(false)
      }

    } catch (err) {
      console.error(err)
      toast.error("Submission failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  // --- STATS CALC ---
  const attemptedCount = Object.keys(answers).length
  const markedCount = markedForReview.length
  const notVisitedCount = questions.length - attemptedCount // Simplified

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] font-sans text-gray-900">
      
      {/* 1. HEADER: Timer & Title */}
      <header className="h-20 bg-white border-b-2 border-gray-100 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="h-10 px-4 bg-black text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
             Q{currentQIndex + 1}
          </div>
          <div>
            <h1 className="font-black text-lg md:text-xl tracking-tight leading-none">{exam.title}</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Practice Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 font-mono font-bold text-xl transition-colors
            ${timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-100 text-gray-800'}
          `}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={() => setIsSubmitModalOpen(true)}
            className="hidden md:block bg-[#CEFF1A] text-black border-2 border-black px-8 py-2.5 rounded-xl font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
          >
            Finish
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. MAIN AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            
            {/* Stats Bar (Between Timer & Question) */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                 <span className="text-xs font-bold text-gray-400 uppercase">Attempted</span>
                 <span className="text-2xl font-black text-blue-600">{attemptedCount}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                 <span className="text-xs font-bold text-gray-400 uppercase">Marked</span>
                 <span className="text-2xl font-black text-purple-600">{markedCount}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                 <span className="text-xs font-bold text-gray-400 uppercase">Remaining</span>
                 <span className="text-2xl font-black text-gray-400">{questions.length - attemptedCount}</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border-2 border-gray-100 shadow-sm flex-1 relative min-h-[400px]">
              
              {/* Bookmark Toggle */}
              <button 
                onClick={() => setMarkedForReview(prev => prev.includes(currentQ.id) ? prev.filter(id => id !== currentQ.id) : [...prev, currentQ.id])}
                className={`absolute top-8 right-8 p-3 rounded-full transition-all border-2 
                  ${markedForReview.includes(currentQ.id) 
                    ? 'bg-purple-100 border-purple-200 text-purple-700' 
                    : 'bg-white border-gray-100 text-gray-300 hover:border-gray-300'}
                `}
              >
                <Bookmark className={`w-6 h-6 ${markedForReview.includes(currentQ.id) ? 'fill-current' : ''}`} />
              </button>

              <div className="mb-10 pr-16">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                  {currentQ.text}
                </h2>
              </div>

              {/* Options */}
              <div className="grid gap-4">
                {currentQ.options?.map((opt: any, idx: number) => {
                  const isSelected = answers[currentQ.id] === opt.id
                  const labels = ['A', 'B', 'C', 'D']
                  
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.id)}
                      className={`
                        w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-5 group
                        ${isSelected 
                          ? 'border-black bg-black text-white shadow-lg' 
                          : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm shrink-0 transition-colors
                        ${isSelected 
                          ? 'bg-[#CEFF1A] border-[#CEFF1A] text-black' 
                          : 'bg-gray-50 border-gray-200 text-gray-400 group-hover:border-gray-400'}
                      `}>
                        {labels[idx] || idx + 1}
                      </div>
                      <span className="text-lg font-medium">
                        {opt.text}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center mt-8 pb-8">
              <button 
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="px-8 py-4 rounded-xl font-bold text-gray-500 bg-white border-2 border-gray-100 hover:border-gray-300 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              
              <button 
                onClick={() => {
                  if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1)
                  else setIsSubmitModalOpen(true)
                }}
                className="group flex items-center gap-3 px-10 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                {currentQIndex === questions.length - 1 ? 'Finish' : 'Next Question'} 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </main>

        {/* 3. RIGHT PANEL (Question Palette) */}
        <aside className="w-80 bg-white border-l-2 border-gray-100 p-8 hidden xl:flex flex-col z-10">
          <div className="flex items-center gap-2 mb-8 text-gray-400 font-bold text-xs uppercase tracking-widest">
            <ListTodo className="w-4 h-4" /> Question Palette
          </div>

          <div className="grid grid-cols-4 gap-3 content-start overflow-y-auto pr-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]
              const isReview = markedForReview.includes(q.id)
              const isCurrent = idx === currentQIndex
              
              let style = "bg-gray-50 text-gray-400 border-transparent hover:border-gray-300"
              
              if (isCurrent) style = "bg-black text-white border-black ring-4 ring-gray-100"
              else if (isReview) style = "bg-purple-100 text-purple-700 border-purple-200"
              else if (isAnswered) style = "bg-blue-50 text-blue-600 border-blue-200 font-bold"

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`
                    w-full aspect-square rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all
                    ${style}
                  `}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="mt-auto pt-8 border-t border-gray-100">
             <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-gray-500 uppercase">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-full"/> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded-full"/> Review</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black rounded-full"/> Current</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full"/> Skipped</div>
             </div>
          </div>
        </aside>
      </div>

      {/* 4. SUBMIT MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl w-full max-w-md p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Finish Test?</h2>
              <button onClick={() => setIsSubmitModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-8 flex gap-4 items-start">
              <AlertCircle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
              <div>
                 <p className="font-bold text-orange-900 text-sm mb-1">Confirm Submission</p>
                 <p className="text-orange-700/80 text-xs leading-relaxed">
                   You have <span className="font-bold text-orange-900">{formatTime(timeLeft)}</span> remaining. 
                   Once submitted, you cannot change your answers.
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="p-4 bg-blue-50 rounded-2xl text-center border border-blue-100">
                 <div className="text-3xl font-black text-blue-600">{Object.keys(answers).length}</div>
                 <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Answered</div>
               </div>
               <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                 <div className="text-3xl font-black text-gray-400">{questions.length - Object.keys(answers).length}</div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skipped</div>
               </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-xl disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}