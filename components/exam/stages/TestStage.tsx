import { useState } from 'react'
import Image from 'next/image'
import { Info, Calculator, ChevronRight, ChevronLeft } from 'lucide-react'
import { Question, ExamData, UserData } from '../types'
import { ExamCalculator } from '../modals/ExamCalculator'
import { QuestionPaperModal } from '../modals/QuestionPaperModal'
import { InstructionModal } from '../modals/InstructionModal'
import { SubmitConfirmationModal } from '../modals/SubmitConfirmationModal'

interface Props {
  exam: ExamData
  questions: Question[]
  user: UserData
  currentQIndex: number
  answers: Record<string, string>
  questionStatus: Record<string, string>
  timeLeft: number
  // Handlers
  onNavigate: (index: number) => void
  onAnswer: (qId: string, optId: string) => void
  onSaveNext: () => void
  onClear: () => void
  onReviewNext: () => void
  onSubmit: () => void
}

export const TestStage = ({
  exam, questions, user, currentQIndex, answers, questionStatus, timeLeft,
  onNavigate, onAnswer, onSaveNext, onClear, onReviewNext, onSubmit
}: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showQuestionPaper, setShowQuestionPaper] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  const currentQ = questions[currentQIndex]
  const notVisitedCount = questions.length - Object.keys(questionStatus).length
  const getCount = (status: string) => Object.values(questionStatus).filter(s => s === status).length

  // --- DYNAMIC DATA CALCULATIONS ---
  const marksPerQuestion = exam.total_marks && exam.total_questions 
    ? Math.round((exam.total_marks / exam.total_questions) * 100) / 100 
    : 1;
    
  // Assuming negative marking is usually 1/4th of positive or specific value. 
  // If you have a specific column for 'negative_marks' in DB, use that instead.
  // For now, based on your boolean 'negative_marking', we display logic:
  const negativeMarks = exam.negative_marking ? (marksPerQuestion * 0.25) : 0;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'answered':
        return { 
          className: "bg-[#2ECC71] text-white border-none",
          style: { clipPath: 'polygon(30% 0%, 70% 0%, 100% 45%, 100% 100%, 0% 100%, 0% 45%)' } 
        }
      case 'not_answered':
        return { 
          className: "bg-[#E74C3C] text-white border-none",
          style: { clipPath: 'polygon(0% 0%, 100% 0%, 100% 45%, 70% 100%, 30% 100%, 0% 45%)' } 
        }
      case 'review':
        return { className: "bg-[#8E44AD] text-white rounded-full", style: {} }
      case 'ans_and_review':
        return { className: "bg-[#8E44AD] text-white rounded-full relative", style: {} }
      case 'not_visited':
      default:
        return { className: "bg-[#E0E0E0] border border-[#BDBDBD] text-black rounded-[2px]", style: {} }
    }
  }

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true)
  }

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false)
    onSubmit()
  }

  return (
      <div className='h-screen p-1 bg-white overflow-x-hidden'>
        <div className='h-full w-full border-4 border-[#336699]'>
          <header className='grid grid-cols-11'>
            <div className='col-span-9 text-center text-black font-bold flex items-center justify-center text-2xl'>
              <h1>Test Explorer Test Portal</h1>
            </div>
            <div className='col-span-2 flex items-center justify-center gap-2'>
              <button className="bg-[#EFEFEF] hover:bg-[#e5e5e5] text-black text-[11px] font-bold px-3 py-1 border border-[#CCCCCC] rounded-md transition-colors flex items-center gap-1" 
              onClick={() => setShowQuestionPaper(true)}>
              Question Paper
            </button>
            <button className="bg-[#EFEFEF] hover:bg-[#e5e5e5] text-black text-[11px] font-bold px-3 py-1 border border-[#CCCCCC] rounded-md transition-colors flex items-center gap-1"
            onClick={() => setShowInstructions(true)} >
              Instructions
            </button>
            </div>
  
            <div className='col-span-9 bg-gray-200 flex items-center justify-between p-4 text-black text-sm font-medium mt-1 border-r'>
              <div className='flex items-center bg-blue-500 p-1 text-white font-bold uppercase'>
                {/* DYNAMIC TITLE */}
                {exam.title || "Mock Test"}
              </div>
              <div onClick={() => setShowCalculator(true)} className="cursor-pointer hover:bg-gray-300 p-1 rounded">
                <Calculator className="w-5 h-5" />
              </div>
            </div>
            
            <div className='col-span-2 mt-2 p-2 row-span-3 flex items-start'>
                <Image
                src="/avatar.png"
                alt="User Icon"
                width={80}
                height={80}
                className="border border-black"
              />
              <div className="font-bold text-black text-lg ml-2">
                {/* DYNAMIC USER NAME */}
                {user?.full_name || "Candidate"}
              </div>
            </div>
  
            <div className='col-span-9 font-extrabold text-black text-md  border-b flex justify-end items-center border-r'>
              Time Left: {formatTime(timeLeft)}
            </div>
            
            <div className='col-span-9 text-sm flex justify-end items-center border-r'>
              {/* DYNAMIC MARKS */}
              Marks for correct answer <span className="text-[#009900] font-bold mx-1">{marksPerQuestion}</span> | 
              Negative Marks <span className="text-[#CC0000] font-bold ml-1">-{negativeMarks}</span>
            </div>
            <div className='border col-span-11'></div>
          </header>
  
          <main className='flex'>
            <div className='h-[34vw] w-full border-b-2'>
              {/* QUESTIONS AREA */}
              <div className='px-4 overflow-auto'>
                <div className='space-y-4'>
                  <div className='font-bold text-black text-lg border-b py-2'>
                    Question No.{currentQIndex + 1}
                  </div>
  
                <div className='flex w-full'>
                    {currentQ.direction && (
                      <div className='w-1/2 min-h-[400px] pr-2 h-full border-r border-gray-300 overflow-y-auto'>
                        <div className='font-bold text-black text-sm mb-2'>
                          Direction :
                        </div>
                        <div className='text-black text-sm leading-relaxed whitespace-pre-wrap font-medium'>
                          {currentQ.direction}
                        </div>
                      </div>
                    )}
                  
                  <div className={`space-y-4 h-full ${currentQ.direction ? 'w-1/2 pl-4' : 'w-full'}`}>
                    <div className="text-black font-medium">
                      {currentQ.text}
                    </div>
                    {currentQ.options.map((option) => (
                      <div key={option.id} className='flex items-center gap-2'>
                        <input
                          type="radio"
                          name={`question_${currentQ.id}`}
                          value={option.id}
                          checked={answers[currentQ.id] === option.id}
                          onChange={() => onAnswer(currentQ.id, option.id)}
                          className="w-4 h-4 accent-[#337AB7]"
                        />
                        <span className='text-black'>{option.text}</span>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
            </div>
  
            <div 
               className={`transition-all border-2 border-black duration-300 ease-in-out h-[500px] bg-[#E5F4FB] flex flex-col shrink-0 relative
                 ${isSidebarOpen ? 'w-[18%] translate-x-0' : 'w-0 translate-x-full opacity-0 overflow-hidden'}
               `}
            >
              <div className="bg-white py-4 border-b border-gray-300 grid grid-cols-2 gap-y-2 text-[10px] text-black font-medium shrink-0">
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-[#2ECC71] text-white font-bold" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 45%, 100% 100%, 0% 100%, 0% 45%)' }}>{getCount('answered')}</div>
                      <span>Answered</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-[#E74C3C] text-white font-bold" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 45%, 70% 100%, 30% 100%, 0% 45%)' }}>{getCount('not_answered')}</div>
                      <span>Not Answered</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-[#E0E0E0] border border-[#BDBDBD] text-black font-bold rounded-[2px]">{notVisitedCount}</div>
                      <span>Not Visited</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center bg-[#5B2C6F] text-white font-bold rounded-full">{getCount('review')}</div>
                      <span>Marked for Review</span>
                   </div>
                   <div className="col-span-2 flex flex-col items-center gap-2 mt-1">
                      <div className="relative w-6 h-6 flex items-center justify-center bg-[#5B2C6F] text-white font-bold rounded-full">
                         {getCount('ans_and_review')}
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2ECC71] border border-white rounded-[1px] flex items-center justify-center">
                             <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                      </div>
                      <span className='text-center'>Answered & Marked for Review <br />(will be considered for evaluation)</span>
                   </div>
              </div>
  
              <div className="bg-[#337AB7] text-white px-3 py-1.5 font-bold text-sm uppercase shrink-0">
                {/* DYNAMIC EXAM TITLE IN SIDEBAR */}
                {exam.title || "Mock Test"}
              </div>
              <div className="bg-[#E5F4FB] px-3 py-1 text-black font-bold text-xs border-b border-gray-300 shrink-0">
                Choose a Question
              </div>
  
              <div className="flex-1 bg-white overflow-y-auto p-3 custom-scrollbar overflow-x-auto">
                <div className="grid grid-cols-5 gap-2 content-start">
                   {questions.map((q, idx) => {
                      let status = 'not_visited'
                      const ans = answers[q.id]
                      const stat = questionStatus[q.id]
                      
                      if (stat === 'review') status = 'review'
                      else if (stat === 'ans_and_review') status = 'ans_and_review'
                      else if (ans) status = 'answered'
                      else if (stat === 'not_answered') status = 'not_answered'
                      else if (idx === currentQIndex) status = 'not_answered' 
  
                      const styleProps = getStatusStyle(status)
  
                      return (
                         <button 
                           key={q.id} 
                           onClick={() => onNavigate(idx)}
                           className={`w-10 h-9 flex items-center justify-center text-xs font-bold transition-all shadow-sm relative
                              ${styleProps.className}
                              ${idx === currentQIndex ? 'ring-2 ring-black z-10' : ''}
                           `}
                           style={styleProps.style}
                         >
                           {idx + 1}
                           {status === 'ans_and_review' && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#2ECC71] border border-white rounded-[1px] flex items-center justify-center">
                                 <div className="w-1 h-1 bg-white rounded-full"></div>
                              </div>
                           )}
                         </button>
                      )
                   })}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="absolute top-1/3 right-0 z-50 bg-[#333] text-white w-5 h-12 flex items-center justify-center rounded-l-md transform -translate-y-1/2 shadow-md hover:bg-black transition-all"
              style={{ right: isSidebarOpen ? '18.2%' : '0' }}
            >
               {isSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
  
            {showCalculator && <ExamCalculator onClose={() => setShowCalculator(false)} />}
              {showQuestionPaper && <QuestionPaperModal questions={questions} onClose={() => setShowQuestionPaper(false)} />}
                {showInstructions && <InstructionModal exam={exam} onClose={() => setShowInstructions(false)} />}
          </main>
  
          <footer className='grid grid-cols-11'>
            <div className='border-b p-4 border-r col-span-9 flex justify-between items-center'>
              <div className='flex items-center gap-4'>
                <button
                  onClick={onReviewNext}
                  className='bg-[#EFEFEF] hover:bg-[#e5e5e5] border border-gray-300 text-black px-4 py-1.5 rounded shadow-sm text-sm font-bold'
                >
                  Mark for Review & Next
                </button>
                <button
                  onClick={onClear}
                  className='bg-[#EFEFEF] hover:bg-[#e5e5e5] border border-gray-300 text-black px-4 py-1.5 rounded shadow-sm text-sm font-bold mr-4'
                >
                  Clear Response
                </button>
                </div>
                <div>
                <button
                  onClick={onSaveNext}
                  className='bg-blue-600 hover:bg-blue-700 text-white border border-gray-300 px-4 py-1.5 rounded shadow-sm text-sm font-bold mr-4'
                >
                  Save & Next
                </button>
              </div>
            </div>
            <div className='col-span-2 p-4 flex justify-center items-center gap-2'>
              <div>
                <button
                  onClick={handleSubmitClick}
                  className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-sm font-bold'
                >
                  Submit Test
                </button>
              </div>
            </div>
          </footer>

          {showSubmitConfirm && (
         <SubmitConfirmationModal 
           timeLeft={timeLeft} 
           onConfirm={handleConfirmSubmit} 
           onCancel={() => setShowSubmitConfirm(false)} 
         />
       )}
        </div>
      </div>
    )
}