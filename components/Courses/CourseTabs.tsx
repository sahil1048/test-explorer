'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Trophy, ArrowUpRight, Clock, HelpCircle, Play } from 'lucide-react'

const SUBJECT_COLORS = [
  'bg-[#E0F7FA] border-[#006064]',
  'bg-[#F3E5F5] border-[#4A148C]',
  'bg-[#FFF3E0] border-[#E65100]',
  'bg-[#E8F5E9] border-[#1B5E20]',
  'bg-[#FFEBEE] border-[#B71C1C]',
]

export default function CourseTabs({ courseId, subjects, mocks, questionsCount }: { courseId: string, subjects: any[], mocks: any[], questionsCount: number }) {
  const [activeTab, setActiveTab] = useState<'subjects' | 'mocks'>('subjects')

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'subjects' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
          }`}
        >
          Subjects
        </button>
        <button
          onClick={() => setActiveTab('mocks')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'mocks' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
          }`}
        >
          Full Mock Tests
        </button>
      </div>

      {/* SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {subjects.length === 0 ? <EmptyState icon={BookOpen} text="No subjects found." /> : 
            subjects.map((subject: any, index: number) => {
              const style = SUBJECT_COLORS[index % SUBJECT_COLORS.length]
              const [bgColor, borderColor] = style.split(' ')
              return (
                <Link key={subject.id} href={`/courses/${courseId}/subjects/${subject.id}`} className="group block relative">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 rounded-4xl border-2 border-black bg-white transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${bgColor} ${borderColor} text-black font-black text-xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        {subject.title.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{subject.title}</h3>
                        <p className="text-sm font-medium text-gray-500">Explore Chapters & Tests</p>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 flex items-center justify-end"><ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-black transition-colors" /></div>
                  </div>
                </Link>
              )
            })
          }
        </div>
      )}

      {/* MOCKS TAB */}
      {activeTab === 'mocks' && (
        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {mocks.length === 0 ? <EmptyState icon={Trophy} text="No full mock tests generated yet." /> :
            mocks.map((mock: any) => (
              <div key={mock.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border-2 border-gray-100 bg-white hover:border-blue-200 transition-all">
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border-2 border-red-100 shrink-0">
                    <Trophy className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{mock.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><Clock className="w-4 h-4" /> {mock.duration_minutes}m</span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><HelpCircle className="w-4 h-4" /> {mock.mock_test_questions?.[0]?.count || 0} Qs</span>
                      <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs uppercase tracking-wider">Full Syllabus</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link 
                    href={`/mocktest/exam/${mock.id}`}
                    className="w-full md:w-auto px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                     Start Test <Play className="w-4 h-4 fill-current" />
                  </Link>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, text }: any) {
  return (
    <div className="p-12 text-center border-3 border-dashed border-gray-200 rounded-4xl bg-gray-50">
      <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 font-medium">{text}</p>
    </div>
  )
}