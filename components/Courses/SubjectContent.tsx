'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  PlayCircle, 
  FileText, 
  Timer, 
  Trophy, 
  ArrowRight, 
} from 'lucide-react'

// Types for our data
type Module = { id: string; title: string; description: string | null; difficulty: string }
type Exam = { id: string; title: string; description: string | null; duration_minutes: number | null }

interface SubjectContentProps {
  modules: Module[]
  practiceTests: Exam[]
  mockTests: Exam[]
  courseId: string   // <--- Added
  subjectId: string  // <--- Added
}

export default function SubjectContent({ 
  modules, 
  practiceTests, 
  mockTests,
  courseId,
  subjectId
}: SubjectContentProps) {
  const [activeTab, setActiveTab] = useState<'prep' | 'practice' | 'mock'>('prep')

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300
        ${activeTab === id 
          ? 'bg-black text-white shadow-lg scale-105' 
          : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )

  return (
    <div>
      {/* --- Tabs Navigation --- */}
      <div className="flex flex-wrap gap-4 mb-10">
        <TabButton id="prep" label="Prep Modules" icon={PlayCircle} />
        <TabButton id="practice" label="Practice Tests" icon={FileText} />
        <TabButton id="mock" label="Mock Tests" icon={Trophy} />
      </div>

      {/* --- Tab Content --- */}
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* 1. Preparatory Modules Tab */}
        {activeTab === 'prep' && (
          <div className="grid gap-4">
            {modules.length === 0 ? <EmptyState label="No modules available yet." /> : 
              modules.map((item) => (
                <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#FFF4C3] rounded-3xl border-2 border-transparent hover:border-black transition-all">
                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-2 border-black/10 shrink-0">
                      <PlayCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-black text-gray-900">{item.title}</h3>
                        <span className="px-2 py-0.5 bg-black/5 text-[10px] font-bold uppercase tracking-wider rounded-md text-black/60">
                          {item.difficulty || 'General'}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium text-sm leading-snug max-w-lg">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* LINK UPDATED: Now points to the nested route */}
                  <Link 
                    href={`/courses/${courseId}/subjects/${subjectId}/learn/${item.id}`} 
                    className="mt-4 md:mt-0 px-6 py-3 bg-white text-black font-bold rounded-xl border-2 border-black/10 hover:bg-black hover:text-white transition-all flex items-center gap-2"
                  >
                    Start Learning
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            }
          </div>
        )}

        {/* 2. Practice Tests Tab */}
        {activeTab === 'practice' && (
          <div className="grid gap-4">
            {practiceTests.length === 0 ? <EmptyState label="No practice tests added." /> : 
              practiceTests.map((exam) => (
                <div key={exam.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#D4F5FF] rounded-3xl border-2 border-transparent hover:border-black transition-all">
                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-2 border-black/10 shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-1">{exam.title}</h3>
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                        <span className="flex items-center gap-1">
                          <Timer className="w-4 h-4" /> {exam.duration_minutes} mins
                        </span>
                        <span>•</span>
                        <span>15 Questions</span>
                      </div>
                    </div>
                  </div>
                  {/* You can move this to a nested route too if you wish, e.g., /take/${exam.id} */}
                  <Link href={`/courses/${courseId}/subjects/${subjectId}/test/practice/${exam.id}`} className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
                    Attempt Now
                  </Link>
                </div>
              ))
            }
          </div>
        )}

        {/* 3. Mock Tests Tab */}
        {activeTab === 'mock' && (
          <div className="grid gap-4">
            {mockTests.length === 0 ? <EmptyState label="Mock tests coming soon." /> : 
              mockTests.map((exam) => (
                <div key={exam.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-[#FFD4D4] rounded-3xl border-2 border-transparent hover:border-black transition-all relative overflow-hidden">
                  <div className="flex gap-5 items-start relative z-10">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-2 border-black/10 shrink-0">
                      <Trophy className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-black text-gray-900">{exam.title}</h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                          High Yield
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium text-sm">Full syllabus coverage • National Ranking</p>
                    </div>
                  </div>
                  <Link href={`/courses/${courseId}/subjects/${subjectId}/test/mock/${exam.id}`} className="relative z-10 mt-4 md:mt-0 px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all">
                    Start Mock
                  </Link>
                </div>
              ))
            }
          </div>
        )}

      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="p-12 text-center border-3 border-dashed border-gray-200 rounded-4xl bg-gray-50">
      <p className="text-gray-400 font-bold text-lg">{label}</p>
    </div>
  )
}