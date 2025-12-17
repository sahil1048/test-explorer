'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Info } from 'lucide-react'
import { submitExamAction } from '../../[testType]/[examId]/actions'
import { InstructionStage } from '@/components/exam/stages/InstructionStage'
import { ConsentStage } from '@/components/exam/stages/ConsentStage'
import { ResultReportModal } from '@/components/exam/modals/ResultReportModal'
import { TestStage } from '@/components/exam/stages/TestStage'
import { Question } from '@/components/exam/types'


interface MockInterfaceProps {
  exam: any
  questions: Question[]
  courseId: string
  subjectId: string
  examId: string
  user: any
}

export default function MockTestInterface({ 
  exam, questions, courseId, subjectId, examId, user
}: MockInterfaceProps) {
  const router = useRouter()
  const [stage, setStage] = useState<'instructions' | 'consent' | 'test' | 'report'>('instructions')
  const [timeLeft, setTimeLeft] = useState((exam?.duration_minutes || 180) * 60)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({}) 
  const [questionStatus, setQuestionStatus] = useState<Record<string, string>>({}) 
  const [reportData, setReportData] = useState<any>(null)

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="bg-white p-8 rounded shadow-md text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Found</h2>
          <button onClick={() => window.history.back()} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">Go Back</button>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQIndex]

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

  const updateStatus = (qId: string, status: string) => {
    setQuestionStatus(prev => ({ ...prev, [qId]: status }))
  }

  const handleAnswer = (qId: string, optId: string) => {
    setAnswers(prev => ({ ...prev, [qId]: optId }))
  }

  const handleSaveNext = () => {
    const isAnswered = !!answers[currentQ.id]
    updateStatus(currentQ.id, isAnswered ? 'answered' : 'not_answered')
    if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1)
  }

  const handleReviewNext = () => {
    const isAnswered = !!answers[currentQ.id]
    updateStatus(currentQ.id, isAnswered ? 'ans_and_review' : 'review')
    if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1)
  }

  const handleClear = () => {
    const newAnswers = { ...answers }
    delete newAnswers[currentQ.id]
    setAnswers(newAnswers)
    updateStatus(currentQ.id, 'not_answered')
  }

  const handleSubmit = async () => {
    let correct = 0
    let incorrect = 0
    const totalQuestions = questions.length
    const answeredCount = Object.keys(answers).length
    const unattempted = totalQuestions - answeredCount

    questions.forEach(q => {
      const userAnswerId = answers[q.id]
      if (userAnswerId) {
        const selectedOpt = q.options.find(o => o.id === userAnswerId)
      }
    })

    const timeTaken = ((exam.duration_minutes || 180) * 60) - timeLeft
    
    const result = await submitExamAction(examId, courseId, subjectId, answers, timeTaken, 'mock')
    const marksPerCorrect = 5 // Based on image
    const marksPerIncorrect = 1 // Negative marking
    
    setReportData({
      score: result?.score || 0, // Replace with actual logic
      totalMarks: exam.total_marks || 200,
      correctCount: result?.correct || 0,
      incorrectCount: result?.incorrect || 0,
      unattemptedCount: totalQuestions - (result?.correct + result?.incorrect) || unattempted,
      timeTaken: timeTaken
    })

    setStage('report')
  }

  return (
    <>
      {stage === 'instructions' && (
        <InstructionStage onNext={() => setStage('consent')} user={user} />
      )}

      {stage === 'consent' && (
        <ConsentStage 
          exam={exam} 
          user={user} 
          onPrev={() => setStage('instructions')} 
          onStart={() => setStage('test')} 
        />
      )}

      {stage === 'test' && (
        <TestStage 
          exam={exam}
          questions={questions}
          user={user}
          currentQIndex={currentQIndex}
          answers={answers}
          questionStatus={questionStatus}
          timeLeft={timeLeft}
          onNavigate={setCurrentQIndex}
          onAnswer={handleAnswer}
          onSaveNext={handleSaveNext}
          onReviewNext={handleReviewNext}
          onClear={handleClear}
          onSubmit={handleSubmit}
        />
      )}

      {stage === 'report' && reportData && (
        <ResultReportModal 
          score={reportData.score}
          totalMarks={reportData.totalMarks}
          correctCount={reportData.correctCount}
          incorrectCount={reportData.incorrectCount}
          unattemptedCount={reportData.unattemptedCount}
          timeTaken={reportData.timeTaken}
          onClose={() => router.push('/dashboard')} // Or wherever you want to go
        />
      )}
    </>
  )
}