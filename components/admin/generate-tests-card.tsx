'use client'

import { useState } from 'react'
import { generatePracticeTestsAction, generateMockTestsAction } from '@/app/dashboard/admin/subjects/actions'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, AlertCircle, Trophy, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

export default function GenerateTestsCard({ 
  subjectId, 
  questionCount,
  existingPracticeCount,
  existingMockCount
}: { 
  subjectId: string, 
  questionCount: number,
  existingPracticeCount: number,
  existingMockCount: number
}) {
  const [loadingPractice, setLoadingPractice] = useState(false)
  const [loadingMock, setLoadingMock] = useState(false)

  // --- Handler for Practice Tests ---
  const handleGeneratePractice = async () => {
    if (!confirm('Reshuffle all questions into new PRACTICE sets (20 Qs each)?')) return
    setLoadingPractice(true)
    try {
      const result = await generatePracticeTestsAction(subjectId)
      result.success ? toast.success(result.message) : toast.error(result.message)
    } catch { toast.error('Failed') }
    setLoadingPractice(false)
  }

  // --- Handler for Mock Tests ---
  const handleGenerateMock = async () => {
    if (!confirm('Reshuffle all questions into new MOCK exams (50 Qs each)?')) return
    setLoadingMock(true)
    try {
      const result = await generateMockTestsAction(subjectId)
      result.success ? toast.success(result.message) : toast.error(result.message)
    } catch { toast.error('Failed') }
    setLoadingMock(false)
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm mt-8">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Test Generator
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md">
            Automatically organize the <strong>{questionCount} questions</strong> in this pool into playable tests.
          </p>
        </div>
        <div className="text-right bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
            <div className="text-3xl font-black text-gray-900">{questionCount}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Questions</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* --- Card 1: Practice Tests --- */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-gray-900">Practice Sets</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4 h-10">
            Generates small sets of <strong>20 Questions</strong> (20 Mins). Ideal for quick revision.
          </p>
          <div className="flex items-center justify-between mt-auto">
             <span className="text-xs font-medium text-gray-400">
               {existingPracticeCount} sets exist
             </span>
             <Button 
                size="sm"
                onClick={handleGeneratePractice} 
                disabled={loadingPractice || questionCount === 0}
                className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-100 hover:text-blue-600"
            >
                {loadingPractice ? <Loader2 className="w-3 h-3 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </div>

        {/* --- Card 2: Mock Tests --- */}
        <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:border-purple-200 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-gray-900">Mock Exams</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4 h-10">
            Generates full exams of <strong>50 Questions</strong> (60 Mins). Includes negative marking (+5/-1).
          </p>
          <div className="flex items-center justify-between mt-auto">
             <span className="text-xs font-medium text-gray-400">
               {existingMockCount} exams exist
             </span>
             <Button 
                size="sm"
                onClick={handleGenerateMock} 
                disabled={loadingMock || questionCount === 0}
                className="bg-black text-white hover:bg-gray-800"
            >
                {loadingMock ? <Loader2 className="w-3 h-3 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </div>

      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
        <AlertCircle className="w-4 h-4 shrink-0" />
        Generating tests reshuffles the question pool. Questions can belong to both a Practice Set and a Mock Exam simultaneously.
      </div>

    </div>
  )
}