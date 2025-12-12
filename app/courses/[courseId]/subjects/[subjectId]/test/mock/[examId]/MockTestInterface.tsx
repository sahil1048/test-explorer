'use client'

import { useState, useEffect } from 'react'
import { submitExamAction } from '../../[testType]/[examId]/actions' // Verify this path
import { 
  Clock, 
  Menu, 
  ChevronRight, 
  ChevronLeft,
  Info
} from 'lucide-react'
import Image from 'next/image'

// --- TYPES ---
type Option = { id: string; text: string }
type Question = { id: string; text: string; options: Option[] }

interface MockInterfaceProps {
  exam: any
  questions: Question[]
  courseId: string
  subjectId: string
  examId: string
}

const STATUS_COLORS = {
  not_visited: 'bg-gray-100 text-black border-gray-300',
  not_answered: 'bg-[#FF3333] text-white',
  answered: 'bg-[#25BA17] text-white',
  review: 'bg-[#7340D4] text-white rounded-full',
  ans_and_review: 'bg-[#7340D4] text-white relative after:content-[""] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-green-400 after:rounded-full'
}

export default function MockTestInterface({ 
  exam, 
  questions, 
  courseId,
  subjectId,
  examId
}: MockInterfaceProps) {
  
  // --- STATE ---
  const [stage, setStage] = useState<'instructions' | 'consent' | 'test'>('instructions')
  const [agreed, setAgreed] = useState(false)
  const [timeLeft, setTimeLeft] = useState((exam?.duration_minutes || 180) * 60)
  
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({}) 
  const [questionStatus, setQuestionStatus] = useState<Record<string, string>>({}) 

  // --- CRITICAL FIX START ---
  // 1. Handle Loading/Empty State immediately
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="bg-white p-8 rounded shadow-md text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Found</h2>
          <p className="text-gray-600 mb-6">
            This test hasn't been set up with questions yet. Please contact your administrator.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }
  // --- CRITICAL FIX END ---

  const currentQ = questions[currentQIndex]

  // --- TIMER ---
  useEffect(() => {
    if (stage !== 'test') return
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
  }, [stage])

  // --- ACTIONS ---
  const handleSaveNext = () => {
    const isAnswered = !!answers[currentQ.id]
    updateStatus(currentQ.id, isAnswered ? 'answered' : 'not_answered')
    moveToNext()
  }

  const handleClear = () => {
    const newAnswers = { ...answers }
    delete newAnswers[currentQ.id]
    setAnswers(newAnswers)
    updateStatus(currentQ.id, 'not_answered')
  }

  const handleReviewNext = () => {
    const isAnswered = !!answers[currentQ.id]
    updateStatus(currentQ.id, isAnswered ? 'ans_and_review' : 'review')
    moveToNext()
  }

  const updateStatus = (qId: string, status: string) => {
    setQuestionStatus(prev => ({ ...prev, [qId]: status }))
  }

  const moveToNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1)
    }
  }

  const handleSubmit = async () => {
    const timeTaken = ((exam.duration_minutes || 180) * 60) - timeLeft
    await submitExamAction(examId, courseId, subjectId, answers, timeTaken, 'mock')
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // --- RENDER STAGES ---

  if (stage === 'instructions') {
    return (
      <div className="min-h-screen bg-white font-sans text-sm text-gray-800 flex flex-col">
        <div className="bg-[#3D85C6] text-white p-3 font-bold text-lg text-center">
          General Instructions
        </div>
        <div className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto w-full">
            <h3 className="font-bold text-lg mb-4 underline">Please read the instructions carefully</h3>
            <div className="space-y-3 leading-relaxed">
              <p><strong>General Instructions:</strong></p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>The total duration of the examination is <strong>{exam.duration_minutes || 180} minutes</strong>.</li>
                <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</li>
                <li>The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                  <ul className="mt-2 space-y-2 ml-4">
                     <li className="flex items-center gap-2"><span className="w-8 h-8 bg-gray-100 border border-gray-300 flex items-center justify-center">1</span> You have not visited the question yet.</li>
                     <li className="flex items-center gap-2"><span className="w-8 h-8 bg-[#FF3333] text-white flex items-center justify-center rounded">2</span> You have not answered the question.</li>
                     <li className="flex items-center gap-2"><span className="w-8 h-8 bg-[#25BA17] text-white flex items-center justify-center rounded">3</span> You have answered the question.</li>
                     <li className="flex items-center gap-2"><span className="w-8 h-8 bg-[#7340D4] text-white flex items-center justify-center rounded-full">4</span> You have NOT answered the question, but have marked the question for review.</li>
                  </ul>
                </li>
              </ol>
            </div>
        </div>
        <div className="p-4 border-t border-gray-300 flex justify-center bg-gray-50">
           <button 
             onClick={() => setStage('consent')}
             className="bg-[#2D8BBA] hover:bg-[#206a8f] text-white px-6 py-2 rounded shadow font-bold"
           >
             Next &gt;&gt;
           </button>
        </div>
      </div>
    )
  }

  if (stage === 'consent') {
    return (
      <div className="min-h-screen bg-white font-sans text-sm text-gray-800 flex flex-col">
        <div className="bg-[#3D85C6] text-white p-3 font-bold text-lg text-center">
          Other Important Instructions
        </div>
        <div className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto w-full">
            <p className="mb-4"><strong>English</strong> is the default language for viewing questions.</p>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-6">
               <p className="text-red-600 font-bold mb-2">Please note:</p>
               <p>1. Questions marked for Review will be considered for evaluation ONLY if they are answered.</p>
               <p>2. Be sure to click "Save & Next" to save your answer.</p>
            </div>
            
            <div className="border-t pt-6 mt-8">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 w-5 h-5 accent-blue-600"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="text-gray-700">
                  I have read and understood the instructions. I agree that in case of not adhering to the instructions, 
                  I shall be liable to be debarred from this Test and/or to disciplinary action.
                </span>
              </label>
            </div>
        </div>
        <div className="p-4 border-t border-gray-300 flex justify-center bg-gray-50">
           <button 
             onClick={() => { if(agreed) setStage('test') }}
             disabled={!agreed}
             className={`px-8 py-3 rounded shadow font-bold text-white transition-colors
               ${agreed ? 'bg-[#2D8BBA] hover:bg-[#206a8f]' : 'bg-gray-400 cursor-not-allowed'}
             `}
           >
             I am ready to begin
           </button>
        </div>
      </div>
    )
  }

  // --- STAGE 3: THE TEST (NTA UI) ---
  return (
    <div className="flex flex-col h-screen bg-white font-sans text-sm overflow-hidden select-none">
      
      {/* 1. HEADER */}
      <header className="h-14 bg-[#333] text-white flex items-center justify-between px-4 shrink-0">
         <div className="font-bold text-lg">Mock Test Engine</div>
         <div className="flex items-center gap-4">
            <div className="font-bold bg-black/30 px-3 py-1 rounded">
               Time Left: <span className="text-yellow-400 font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
         </div>
      </header>

      {/* 2. MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: QUESTION AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Section Header */}
          <div className="h-10 bg-white border-b border-gray-300 flex items-center px-4 font-bold text-blue-800 shadow-sm">
             {exam.title || "Section 1"}
             <div className="ml-auto bg-blue-600 text-white px-2 py-0.5 text-xs rounded">
               +1.0 / -0.0
             </div>
          </div>

          {/* Question Text */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
             <div className="flex gap-2 mb-4 border-b border-gray-100 pb-4">
               <span className="font-bold text-red-600">Q.{currentQIndex + 1})</span>
               <div className="text-lg text-gray-800 leading-relaxed font-medium">
                 {currentQ.text}
               </div>
             </div>

             {/* Options */}
             <div className="space-y-3 pl-2">
               {currentQ.options.map((opt, idx) => (
                 <label 
                   key={opt.id} 
                   className="flex items-start gap-3 p-2 hover:bg-blue-50 rounded cursor-pointer group"
                 >
                   <input 
                     type="radio" 
                     name={`q-${currentQ.id}`}
                     className="mt-1.5 w-4 h-4 accent-blue-600"
                     checked={answers[currentQ.id] === opt.id}
                     onChange={() => setAnswers(prev => ({...prev, [currentQ.id]: opt.id}))}
                   />
                   <span className="text-gray-700 text-base">{opt.text}</span>
                 </label>
               ))}
             </div>
          </div>

          {/* Footer Navigation */}
          <div className="h-16 bg-white border-t border-gray-300 flex items-center justify-between px-4 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
             <div className="flex gap-2">
                <button 
                  onClick={handleReviewNext}
                  className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Mark for Review & Next
                </button>
                <button 
                  onClick={handleClear}
                  className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Clear Response
                </button>
             </div>

             <button 
               onClick={handleSaveNext}
               className="px-8 py-2 bg-[#2D8BBA] hover:bg-[#206a8f] text-white font-bold rounded shadow-sm border border-[#206a8f]"
             >
               Save & Next
             </button>
          </div>
        </div>

        {/* RIGHT: SIDEBAR (Palette) */}
        <div className="w-80 bg-[#E5F6FD] border-l border-gray-300 flex flex-col shrink-0">
          
          {/* User Info */}
          <div className="h-24 bg-white border-b border-gray-300 flex items-center p-4 gap-4">
             <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden border border-gray-300 relative">
               <Image src="/leftman.png" alt="Candidate" fill className="object-cover" />
             </div>
             <div className="text-xs">
               <p className="font-bold text-gray-900 text-sm">Student Name</p>
               <p className="text-gray-500">Candidate</p>
             </div>
          </div>

          {/* Legend */}
          <div className="bg-white p-3 text-[10px] grid grid-cols-2 gap-2 border-b border-gray-300">
             <div className="flex items-center gap-1"><span className={`w-6 h-6 flex items-center justify-center rounded ${STATUS_COLORS.answered}`}>0</span> Answered</div>
             <div className="flex items-center gap-1"><span className={`w-6 h-6 flex items-center justify-center rounded ${STATUS_COLORS.not_answered}`}>0</span> Not Answered</div>
             <div className="flex items-center gap-1"><span className={`w-6 h-6 flex items-center justify-center rounded border bg-gray-100`}>0</span> Not Visited</div>
             <div className="flex items-center gap-1"><span className={`w-6 h-6 flex items-center justify-center rounded-full bg-[#7340D4] text-white`}>0</span> Review</div>
          </div>

          {/* Questions Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="font-bold bg-[#3D85C6] text-white px-2 py-1 mb-3 text-xs">Questions</h4>
            <div className="grid grid-cols-4 gap-2">
               {questions.map((q, idx) => {
                 let status = 'not_visited'
                 const ans = answers[q.id]
                 const stat = questionStatus[q.id]
                 
                 // Determine Logic
                 if (stat === 'review') status = 'review'
                 else if (stat === 'ans_and_review') status = 'ans_and_review'
                 else if (ans) status = 'answered'
                 else if (stat === 'not_answered') status = 'not_answered'
                 else if (idx === currentQIndex) status = 'not_answered' // Current active turns red typically in NTA

                 // @ts-ignore
                 const cssClass = STATUS_COLORS[status] || 'bg-gray-100 border border-gray-300'

                 return (
                   <button
                     key={q.id}
                     onClick={() => setCurrentQIndex(idx)}
                     className={`w-10 h-9 flex items-center justify-center text-xs font-bold rounded shadow-sm transition-all
                       ${cssClass}
                       ${idx === currentQIndex ? 'ring-2 ring-blue-400 z-10' : ''}
                     `}
                   >
                     {idx + 1}
                   </button>
                 )
               })}
            </div>
          </div>

          {/* Submit Button Area */}
          <div className="p-4 bg-[#E5F6FD] border-t border-gray-300 text-center">
             <button 
               onClick={handleSubmit}
               className="w-full bg-[#25BA17] hover:bg-[#1a9c0e] text-white font-bold py-2 rounded shadow"
             >
               Submit Test
             </button>
          </div>

        </div>

      </div>

    </div>
  )
}