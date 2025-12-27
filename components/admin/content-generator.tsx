'use client'

import { useState } from 'react'
import { generatePracticeTestsAction, generateMockTestsAction } from '@/app/dashboard/admin/subjects/actions'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, BookOpen, FileText, Trophy, Database } from 'lucide-react'
import { toast } from 'sonner'

export default function ContentGenerator({ 
  subjectId, 
  questionCount,
  counts
}: { 
  subjectId: string, 
  questionCount: number,
  counts: { prep: number, practice: number, mock: number }
}) {
  const [loading, setLoading] = useState<'prep' | 'practice' | 'mock' | null>(null)

  const handleGenerate = async (type: 'prep' | 'practice' | 'mock') => {
    const label = type === 'prep' ? 'Prep Modules' : type === 'practice' ? 'Practice Tests' : 'Mock Exams'
    
    if (!confirm(`WARNING: This will DELETE all existing ${label} for this subject and regenerate them from the Question Pool.\n\nAre you sure?`)) {
      return
    }

    setLoading(type)
    try {
      let result
       if (type === 'practice') result = await generatePracticeTestsAction(subjectId)
      else if (type === 'mock') result = await generateMockTestsAction(subjectId)

      if (result?.success) toast.success(result.message)
      else toast.error(result?.message || 'Failed')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Pool Status */}
      <div className="bg-linear-to-r from-gray-900 to-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">
                <Database className="w-4 h-4" /> Subject Question Pool
              </div>
              <div className="text-5xl font-black tracking-tighter">{questionCount}</div>
              <p className="text-gray-400 mt-2">Total questions available for generation</p>
            </div>
            {/* You could add a 'Manage Pool' button here linking to uploads */}
         </div>
      </div>

      {/* Generation Grid */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* 2. Practice Tests */}
        <GeneratorCard 
          icon={FileText}
          title="Practice Tests"
          desc="Sets of 20 questions (20 mins)."
          count={counts.practice}
          loading={loading === 'practice'}
          totalQuestions={questionCount}
          onGenerate={() => handleGenerate('practice')}
          color="purple"
        />

        {/* 3. Mock Exams */}
        <GeneratorCard 
          icon={Trophy}
          title="Mock Exams"
          desc="Full exams of 50 questions (60 mins)."
          count={counts.mock}
          loading={loading === 'mock'}
          totalQuestions={questionCount}
          onGenerate={() => handleGenerate('mock')}
          color="orange"
        />

      </div>
    </div>
  )
}

function GeneratorCard({ icon: Icon, title, desc, count, loading, totalQuestions, onGenerate, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 border-blue-100 text-blue-600 hover:border-blue-300",
    purple: "bg-purple-50 border-purple-100 text-purple-600 hover:border-purple-300",
    orange: "bg-orange-50 border-orange-100 text-orange-600 hover:border-orange-300",
  }
  
  return (
    <div className={`p-6 rounded-3xl border-2 transition-all ${colors[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-gray-900">{count}</div>
          <div className="text-[10px] font-bold uppercase text-gray-400">Generated</div>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 font-medium leading-tight mb-6 h-10">{desc}</p>
      
      <Button 
        onClick={onGenerate} 
        disabled={loading || totalQuestions === 0}
        className="w-full bg-white text-black border-2 border-black/5 hover:bg-black hover:text-white font-bold h-12 rounded-xl transition-all shadow-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
        {count > 0 ? 'Regenerate' : 'Generate'}
      </Button>
    </div>
  )
}