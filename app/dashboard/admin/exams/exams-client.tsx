'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, FileText, PlayCircle, Trophy, BookOpen } from 'lucide-react'
import { deleteExamAction } from './actions'

interface ExamItem {
  id: string
  title: string
  description?: string
  subjects?: { title: string }
  is_published: boolean
  question_count?: number
}

interface ExamsClientProps {
  prepModules: ExamItem[]
  mockTests: ExamItem[]
  practiceTests: ExamItem[]
}

export default function ExamsClient({ prepModules, mockTests, practiceTests }: ExamsClientProps) {
  const [activeTab, setActiveTab] = useState<'prep' | 'mock' | 'practice'>('prep')

  const getData = () => {
    switch (activeTab) {
      case 'prep': return prepModules
      case 'mock': return mockTests
      case 'practice': return practiceTests
      default: return []
    }
  }

  const items = getData()

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('prep')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'prep' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
        >
          <PlayCircle className="w-4 h-4" /> Prep Modules
        </button>
        <button
          onClick={() => setActiveTab('mock')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'mock' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
        >
          <Trophy className="w-4 h-4" /> Mock Tests
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'practice' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
        >
          <FileText className="w-4 h-4" /> Practice Tests
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 capitalize">{activeTab} Management</h2>
        <Link 
          href={`/dashboard/admin/exams/new?type=${activeTab}`}
          className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-800 shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New
        </Link>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <p className="text-gray-400 font-medium">No items found in this section.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 transition-all shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {item.is_published ? 'Live' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded">
                    <BookOpen className="w-3 h-3" /> {item.subjects?.title || 'No Subject'}
                  </span>
                  {/* Placeholder for question count logic if needed later */}
                  {/* <span>• {item.question_count || 0} Questions</span> */}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link 
                  href={`/dashboard/admin/exams/${item.id}/edit?type=${activeTab}`}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <form action={deleteExamAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="type" value={activeTab} />
                  <button 
                    type="submit" 
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}