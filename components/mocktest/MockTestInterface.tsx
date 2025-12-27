'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Clock, ChevronLeft, ChevronRight, Flag, Menu, X, 
  Loader2, CheckCircle, Info 
} from 'lucide-react'
import { toast } from 'sonner'
import { submitMockTestAction } from '@/app/mocktest/actions'
import { ResultReportModal } from '@/components/exam/modals/ResultReportModal'

interface Question {
  id: string
  question_text: string
  options: any[] 
}

// 1. Updated Interface to match your Page props
interface MockTestInterfaceProps {
  mockTest: any      // Renamed from 'exam' to 'mockTest'
  questions: Question[]
  courseId: string   // Added
  subjectId: string  // Added
  examId: string     // Added
  user: any
  attempt: any
}

export default function MockTestInterface({ 
  mockTest, 
  questions, 
  courseId, 
  subjectId, 
  examId, 
  user, 
  attempt 
}: MockTestInterfaceProps) {
  const router = useRouter()

  // Use mockTest as our exam object
  const exam = mockTest 

  // --- State ---
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(attempt?.answers || {})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [visited, setVisited] = useState<Set<string>>(new Set([questions[0]?.id]))
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  // --- Timer Logic ---
  const calculateTimeLeft = () => {
    if (!attempt?.started_at) return (exam.duration_minutes || 180) * 60
    
    const startTime = new Date(attempt.started_at).getTime()
    const now = new Date().getTime()
    const elapsedSeconds = Math.floor((now - startTime) / 1000)
    const totalSeconds = (exam.duration_minutes || 180) * 60
    
    return Math.max(0, totalSeconds - elapsedSeconds)
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
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
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // --- Navigation ---
  const currentQuestion = questions[currentQIndex]

  const handleQuestionChange = (index: number) => {
    setCurrentQIndex(index)
    setVisited(prev => new Set(prev).add(questions[index].id))
    setIsSidebarOpen(false)
  }

  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }))
  }

  const handleClearResponse = () => {
    const newAnswers = { ...answers }
    delete newAnswers[currentQuestion.id]
    setAnswers(newAnswers)
  }

  const toggleMarkForReview = () => {
    const newSet = new Set(markedForReview)
    if (newSet.has(currentQuestion.id)) newSet.delete(currentQuestion.id)
    else newSet.add(currentQuestion.id)
    setMarkedForReview(newSet)
  }

  // --- Submission ---
  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const timeTaken = ((exam.duration_minutes || 180) * 60) - timeLeft

    try {
      // Call server action with examId
      const result = await submitMockTestAction(
        examId,
        attempt.id,
        answers,
        timeTaken
      )

      const totalQuestions = questions.length
      const unattempted = totalQuestions - (result.correct + result.incorrect)

      setReportData({
        score: result.score,
        totalMarks: result.totalMarks,
        correctCount: result.correct,
        incorrectCount: result.incorrect,
        unattemptedCount: unattempted,
        timeTaken: timeTaken
      })
      
      toast.success("Test Submitted Successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to submit test.")
      setIsSubmitting(false)
    }
  }

  // --- Helpers ---
  const getQuestionStatus = (qId: string, index: number) => {
    const isCurrent = index === currentQIndex
    const isAnswered = answers[qId] !== undefined
    const isMarked = markedForReview.has(qId)
    const isVisited = visited.has(qId)

    if (isCurrent) return 'ring-2 ring-black ring-offset-2 border-black'
    if (isMarked && isAnswered) return 'bg-purple-600 text-white border-purple-600'
    if (isMarked) return 'bg-purple-100 text-purple-700 border-purple-300'
    if (isAnswered) return 'bg-green-500 text-white border-green-600'
    if (isVisited) return 'bg-red-50 text-red-700 border-red-200'
    return 'bg-gray-50 text-gray-400 border-gray-200'
  }

  // --- View: Report ---
  if (reportData) {
    return (
      <ResultReportModal 
        {...reportData}
        onClose={() => router.push(`/courses/${courseId}`)} 
      />
    )
  }

  // --- View: Test ---
  if (!currentQuestion) return <div>Loading...</div>

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 bg-white z-20">
        <h1 className="font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">
          {exam.title}
        </h1>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono font-bold text-lg border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-900 border-gray-200'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
          
          <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
            <span className="font-bold text-gray-500 text-sm">Question {currentQIndex + 1} of {questions.length}</span>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded">+4 Marks</span>
              <span className="text-red-500 bg-red-50 px-2 py-1 rounded">-1 Mark</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                {currentQuestion.question_text}
              </div>

              <div className="space-y-3">
                {currentQuestion.options?.map((option: any) => (
                  <label 
                    key={option.id}
                    className={`
                      flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all group
                      ${answers[currentQuestion.id] === option.id 
                        ? 'border-black bg-gray-50' 
                        : 'border-gray-100 hover:border-gray-300 bg-white'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                      ${answers[currentQuestion.id] === option.id 
                        ? 'border-black bg-black' 
                        : 'border-gray-300 group-hover:border-gray-400'}
                    `}>
                      {answers[currentQuestion.id] === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-lg text-gray-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border-t border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMarkForReview}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${markedForReview.has(currentQuestion.id) ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                <Flag className="w-4 h-4" />
                {markedForReview.has(currentQuestion.id) ? 'Unmark' : 'Review'}
              </button>
              <button onClick={handleClearResponse} className="px-4 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleQuestionChange(currentQIndex - 1)}
                disabled={currentQIndex === 0}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                   if (currentQIndex === questions.length - 1) handleSubmit()
                   else handleQuestionChange(currentQIndex + 1)
                }}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold bg-black text-white hover:bg-gray-800 flex items-center gap-2"
              >
                {currentQIndex === questions.length - 1 ? 'Submit Test' : 'Next Question'}
                {currentQIndex !== questions.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 transform transition-transform duration-300 z-30
          lg:relative lg:transform-none lg:block
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Question Palette</h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-100 border border-red-200" /> Visited</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300" /> Review</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200" /> Not Visited</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-5 gap-3">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => handleQuestionChange(idx)}
                    className={`
                      w-10 h-10 rounded-lg font-bold text-sm flex items-center justify-center border transition-all
                      ${getQuestionStatus(q.id, idx)}
                    `}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
               <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Submit Final Test
              </button>
            </div>
          </div>
        </aside>

        {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      </div>
    </div>
  )
}