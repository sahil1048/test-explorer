'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { 
  Plus, Pencil, Trash2, 
  PlayCircle, Trophy, FileText, 
  Layers, FolderOpen, BookOpen, ChevronDown, ChevronRight 
} from 'lucide-react'
import { deleteExamAction } from './actions'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// --- TYPES ---
type Item = { id: string; title: string; is_published: boolean; created_at: string; category?: string }
type Subject = { 
  id: string; title: string; 
  prep_modules: Item[]; 
  practice_tests: Item[]; 
  exams: Item[] 
}
type Course = { id: string; title: string; subjects: Subject[] }
type Stream = { id: string; title: string; courses: Course[] }

export default function ExamsClient({ streams }: { streams: Stream[] }) {
  const [activeTab, setActiveTab] = useState<'prep' | 'mock' | 'practice'>('prep')

  // Helper to get the correct list based on active tab
  const getItems = (subject: Subject) => {
    switch (activeTab) {
      case 'prep': return subject.prep_modules || []
      case 'practice': return subject.practice_tests || []
      case 'mock': 
        // Filter exams table for category 'mock' (just in case)
        return subject.exams?.filter(e => e.category === 'mock') || []
      default: return []
    }
  }

  // Helper for Tab Styling
  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
        ${activeTab === id 
          ? 'bg-black text-white shadow-md' 
          : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-black'}
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )

  return (
    <div>
      {/* --- HEADER CONTROLS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit space-x-2">
          <TabButton id="prep" label="Prep Modules" icon={PlayCircle} />
          <TabButton id="mock" label="Mock Tests" icon={Trophy} />
          <TabButton id="practice" label="Practice Tests" icon={FileText} />
        </div>

        {/* Add Button */}
        <Link 
          href={`/dashboard/admin/exams/new?type=${activeTab}`}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
        >
          <Plus className="w-4 h-4" /> Create {activeTab === 'prep' ? 'Module' : activeTab === 'mock' ? 'Mock Test' : 'Practice Test'}
        </Link>
      </div>

      {/* --- HIERARCHY LIST --- */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {(!streams || streams.length === 0) ? (
          <div className="p-12 text-center text-gray-400">No content found.</div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {streams.map((stream) => (
              <AccordionItem key={stream.id} value={stream.id} className="border-b last:border-0 px-0">
                
                {/* LEVEL 1: STREAM */}
                <AccordionTrigger className="hover:no-underline py-4 px-6 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-bold text-gray-800">{stream.title}</span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-0 pt-0">
                  <div className="bg-gray-50/50 border-t border-gray-100 pl-6 md:pl-10">
                    
                    {(!stream.courses || stream.courses.length === 0) && (
                       <p className="py-4 text-sm text-gray-400 italic">No exams found in this stream.</p>
                    )}

                    {stream.courses.map((course) => (
                      <Accordion key={course.id} type="multiple" className="border-l border-gray-200 ml-4">
                        <AccordionItem value={course.id} className="border-0">
                          
                          {/* LEVEL 2: COURSE (EXAM) */}
                          <AccordionTrigger className="hover:no-underline py-3 px-4 hover:text-blue-600 text-gray-700">
                             <div className="flex items-center gap-2">
                                <FolderOpen className="w-4 h-4 text-gray-400" />
                                <span className="font-bold text-sm">{course.title}</span>
                             </div>
                          </AccordionTrigger>

                          <AccordionContent className="pb-4 pt-0 pl-8 pr-4">
                             {(!course.subjects || course.subjects.length === 0) ? (
                                <p className="text-xs text-gray-400 italic py-2">No subjects.</p>
                             ) : (
                                <div className="grid gap-4 mt-2">
                                   {course.subjects.map((subject) => {
                                      const items = getItems(subject)

                                      // Only show subject if it has items OR allow showing empty to indicate where to add?
                                      // Let's show it so users know the structure exists.
                                      return (
                                        <div key={subject.id} className="bg-white rounded-xl border border-gray-200 p-4">
                                          
                                          {/* LEVEL 3: SUBJECT HEADER */}
                                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                             <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{subject.title}</span>
                                          </div>

                                          {/* LEVEL 4: ACTUAL ITEMS (Modules/Tests) */}
                                          <div className="space-y-2">
                                             {items.length === 0 ? (
                                                <p className="text-xs text-gray-400 italic">No {activeTab}s created yet.</p>
                                             ) : (
                                                items.map((item) => (
                                                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:border-blue-100 border border-transparent transition-all group/item">
                                                     <div>
                                                        <h4 className="font-bold text-gray-800 text-sm mb-0.5">{item.title}</h4>
                                                        <div className="flex items-center gap-2">
                                                           <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                              {item.is_published ? 'Live' : 'Draft'}
                                                           </span>
                                                           <span className="text-[10px] text-gray-400">
                                                              {new Date(item.created_at).toLocaleDateString()}
                                                           </span>
                                                        </div>
                                                     </div>

                                                     <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100 transition-opacity">
                                                        <Link 
                                                          href={`/dashboard/admin/exams/${item.id}/edit?type=${activeTab}`}
                                                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                                                        >
                                                          <Pencil className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <form onSubmit={async (e) => {
                                                          e.preventDefault()
                                                          const formData = new FormData(e.currentTarget)
                                                          const result = await deleteExamAction(formData)
                                                          if (result && 'error' in result) {
                                                            toast.error(result.error)
                                                          } else {
                                                            toast.success('Deleted successfully')
                                                          }
                                                        }}>
                                                          <input type="hidden" name="id" value={item.id} />
                                                          <input type="hidden" name="type" value={activeTab} />
                                                          <button 
                                                            type="submit" 
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-md transition-colors"
                                                          >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                          </button>
                                                        </form>
                                                     </div>
                                                  </div>
                                                ))
                                             )}
                                          </div>

                                        </div>
                                      )
                                   })}
                                </div>
                             )}
                          </AccordionContent>

                        </AccordionItem>
                      </Accordion>
                    ))}

                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}