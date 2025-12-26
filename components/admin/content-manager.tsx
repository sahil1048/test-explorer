'use client'

import { useState, useMemo, useEffect } from 'react'
import { 
  Plus, Pencil, Trash2, Layers, FolderOpen, BookOpen, 
  ChevronRight, ChevronDown, X, Save, Search 
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'

// Import Server Actions
import {
  createStreamAction, updateStreamAction, deleteStreamAction,
} from '@/app/dashboard/admin/streams/actions'
import {
  createCourseAction, updateCourseAction, deleteCourseAction
} from '@/app/dashboard/admin/courses/actions'
import {
  createSubjectAction, updateSubjectAction, deleteSubjectAction
} from '@/app/dashboard/admin/subjects/actions'

// --- TYPES ---
type Stream = {
  id: string; 
  title: string;
  description?: string;
  icon_key?: string;
  bg_color?: string;
  order_index?: number;
  courses: {
    id: string; title: string;
    subjects: { id: string; title: string }[]
  }[]
}

// --- ICON UTILS ---
const iconList = Object.keys(LucideIcons).filter((key) => isNaN(Number(key)) && key !== 'createLucideIcon' && key !== 'default')

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name]
  if (!IconComponent) return <LucideIcons.HelpCircle className={className} />
  return <IconComponent className={className} />
}

export default function ContentManager({ streams }: { streams: Stream[] }) {
  
  // --- MODAL STATE ---
  const [modal, setModal] = useState<{
    type: 'stream' | 'exam' | 'subject';
    mode: 'create' | 'edit';
    parentId?: string; // category_id or course_id
    data?: any;
  } | null>(null)

  // --- STREAM FORM STATE ---
  const [streamForm, setStreamForm] = useState({
    title: '',
    description: '',
    icon: 'PenTool',
    color: '#CEFF1A',
    order: 1
  })
  
  // Icon Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Accordion State
  const [openStreams, setOpenStreams] = useState<Record<string, boolean>>({})
  const [openExams, setOpenExams] = useState<Record<string, boolean>>({})

  const toggleStream = (id: string) => setOpenStreams(p => ({ ...p, [id]: !p[id] }))
  const toggleExam = (id: string) => setOpenExams(p => ({ ...p, [id]: !p[id] }))

  // --- HELPERS ---
  
  // Open Stream Modal (Pre-fill data if edit)
  const openStreamModal = (mode: 'create' | 'edit', data?: Stream) => {
    if (mode === 'edit' && data) {
      // Extract hex color from "bg-[#123456]"
      const hexMatch = data.bg_color?.match(/#([0-9a-fA-F]{6})/)
      const color = hexMatch ? `#${hexMatch[1]}` : '#CEFF1A'
      
      setStreamForm({
        title: data.title,
        description: data.description || '',
        icon: data.icon_key || 'PenTool',
        color: color,
        order: data.order_index || 1
      })
    } else {
      // Default
      setStreamForm({
        title: '',
        description: '',
        icon: 'PenTool',
        color: '#CEFF1A',
        order: 1
      })
    }
    setModal({ type: 'stream', mode, data })
  }

  // Filter Icons
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return iconList.slice(0, 70) 
    return iconList.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 70)
  }, [searchQuery])

  // --- RENDERERS ---

  // 1. ADVANCED STREAM MODAL
  const renderStreamModal = () => {
    const isEdit = modal?.mode === 'edit'
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in min-h-screen">
        <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
          
          {/* LEFT: FORM */}
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900">{isEdit ? 'Edit Stream' : 'New Stream'}</h3>
              <button onClick={() => setModal(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
            </div>

            <form action={async (formData) => {
                // Manually inject state values into formData
                formData.set('bg_color', `bg-[${streamForm.color}]`)
                formData.set('icon_key', streamForm.icon)
                
                if (isEdit) {
                   await updateStreamAction(formData)
                } else {
                   await createStreamAction(formData)
                }
                setModal(null)
            }} className="space-y-6">
              
              {isEdit && <input type="hidden" name="id" value={modal?.data?.id} />}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                  <input 
                    name="title" 
                    value={streamForm.title}
                    onChange={e => setStreamForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Engineering" 
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Order</label>
                  <input 
                    name="order_index" 
                    type="number" 
                    value={streamForm.order}
                    onChange={e => setStreamForm(p => ({ ...p, order: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  rows={2}
                  value={streamForm.description}
                  onChange={e => setStreamForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" 
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Icon</label>
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 shrink-0">
                     <DynamicIcon name={streamForm.icon} className="w-6 h-6 text-gray-900" />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-left text-sm font-medium text-gray-700 hover:border-black transition-all flex items-center justify-between"
                  >
                    <span>{streamForm.icon}</span>
                    <span className="text-xs bg-black text-white px-2 py-1 rounded">Change</span>
                  </button>
                </div>
                
                {/* Icon Picker Dropdown */}
                {isPickerOpen && (
                  <div className="mt-2 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="mb-3 relative">
                       <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                       <input 
                         type="text" 
                         placeholder="Search icons..." 
                         className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200"
                         onChange={(e) => setSearchQuery(e.target.value)}
                       />
                    </div>
                    <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                       {filteredIcons.map(icon => (
                         <button 
                           key={icon} 
                           type="button"
                           onClick={() => { setStreamForm(p => ({...p, icon})); setIsPickerOpen(false) }}
                           className={`p-2 rounded-lg flex items-center justify-center hover:bg-white hover:shadow-sm transition-all ${streamForm.icon === icon ? 'bg-black text-white' : 'text-gray-500'}`}
                         >
                           <DynamicIcon name={icon} className="w-5 h-5" />
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Color</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    value={streamForm.color}
                    onChange={e => setStreamForm(p => ({ ...p, color: e.target.value }))}
                    className="h-10 w-16 p-1 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-600">{streamForm.color}</span>
                </div>
              </div>

              <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all shadow-lg">
                {isEdit ? 'Update Stream' : 'Create Stream'}
              </button>
            </form>
          </div>

          {/* RIGHT: PREVIEW */}
          <div className="w-full md:w-80 bg-gray-50 p-8 border-l border-gray-100 flex flex-col items-center justify-center">
             <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Live Preview</p>
             <div 
               className="w-full aspect-square rounded-4xl p-6 flex flex-col justify-between shadow-2xl transition-all duration-300"
               style={{ backgroundColor: streamForm.color }}
             >
                <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                   <DynamicIcon name={streamForm.icon} className="w-6 h-6 text-gray-900" />
                </div>

                <div className="text-left">
                   <h3 className="text-3xl font-black text-gray-900 leading-none mb-2 wrap-break-words">
                     {streamForm.title || 'Title'}
                   </h3>
                   <p className="text-sm font-medium text-gray-900/60 line-clamp-3 leading-snug">
                     {streamForm.description || 'Description will appear here...'}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. SIMPLE MODAL (EXAM & SUBJECT)
  const renderSimpleModal = () => {
    let action, headerTitle, titlePlaceholder
    const isExam = modal?.type === 'exam'
    const isEdit = modal?.mode === 'edit'

    if (isExam) {
      action = isEdit ? updateCourseAction : createCourseAction
      headerTitle = isEdit ? 'Edit Exam' : 'Add New Exam'
      titlePlaceholder = 'e.g. JEE Mains'
    } else {
      action = isEdit ? updateSubjectAction : createSubjectAction
      headerTitle = isEdit ? 'Edit Subject' : 'Add New Subject'
      titlePlaceholder = 'e.g. Physics'
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in min-h-screen">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900">{headerTitle}</h3>
            <button onClick={() => setModal(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-4 h-4" /></button>
          </div>
          
          <form action={async (formData) => { await action(formData); setModal(null); }} className="space-y-4">
            {isEdit && <input type="hidden" name="id" value={modal?.data?.id} />}
            {modal?.parentId && <input type="hidden" name={isExam ? 'category_id' : 'course_id'} value={modal.parentId} />}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
              <input name="title" defaultValue={modal?.data?.title} placeholder={titlePlaceholder} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
            </div>

            {isExam && (
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea name="description" defaultValue={modal?.data?.description} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
                  <div className="flex items-center gap-2 mt-4">
                    <input type="checkbox" name="is_published" defaultChecked={modal?.data?.is_published} id="pub" className="w-4 h-4" />
                    <label htmlFor="pub" className="text-sm font-bold text-gray-700">Publish Exam</label>
                  </div>
               </div>
            )}

            <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all mt-2">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    )
  }

  // --- MAIN RENDER ---
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {modal?.type === 'stream' && renderStreamModal()}
      {(modal?.type === 'exam' || modal?.type === 'subject') && renderSimpleModal()}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Content Manager</h1>
          <p className="text-gray-500">Manage Streams, Exams, and Subjects in one place.</p>
        </div>
        <button 
          onClick={() => openStreamModal('create')}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Stream
        </button>
      </div>

      {/* --- CONTENT TREE --- */}
      <div className="space-y-4">
        {streams.map((stream) => {
           const isStreamOpen = openStreams[stream.id]

           const rawBg = stream.bg_color || 'bg-gray-100'
           const isArbitrary = rawBg.startsWith('bg-[#') && rawBg.endsWith(']')
           const hexColor = isArbitrary ? rawBg.slice(4, -1) : null
           const finalClass = hexColor ? '' : rawBg
           const finalStyle = hexColor ? { backgroundColor: hexColor } : undefined
           
           return (
            <div key={stream.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm transition-all">
              
              {/* LEVEL 1: STREAM ROW */}
              <div className="flex items-center justify-between p-4 bg-gray-50/50 border-b border-gray-100 group">
                <button onClick={() => toggleStream(stream.id)} className="flex items-center gap-4 flex-1 text-left">
                  
                  {/* Visual Indicator */}
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-black/10 shrink-0 ${finalClass}`}
                    style={finalStyle}
                  >
                     <DynamicIcon name={stream.icon_key || 'Circle'} className="w-5 h-5 text-gray-900 opacity-70" />
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {stream.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                        {stream.courses.length} Exams
                      </span>
                      <span>•</span>
                      {/* Accordion State Indicator */}
                      <span className="text-gray-400">
                        {isStreamOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1">
                   <button onClick={() => openStreamModal('edit', stream)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                   <form action={deleteStreamAction}><input type="hidden" name="id" value={stream.id} /><button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button></form>
                   <button onClick={() => setModal({ type: 'exam', mode: 'create', parentId: stream.id })} className="ml-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1 shadow-md hover:shadow-lg transition-all"><Plus className="w-3 h-3" /> Exam</button>
                </div>
              </div>

              {/* LEVEL 2: EXAM LIST */}
              {isStreamOpen && (
                <div className="p-4 bg-white space-y-3">
                  {stream.courses.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No exams yet. Click "+ Exam" to add one.</p>}
                  
                  {stream.courses.map((exam) => {
                    const isExamOpen = openExams[exam.id]
                    // Safe access to subject length
                    const subjectCount = exam.subjects?.length || 0

                    return (
                      <div key={exam.id} className="border border-gray-100 rounded-2xl overflow-hidden transition-all hover:border-gray-300">
                        <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleExam(exam.id)}>
                           <button className="flex items-center gap-3 flex-1 text-left pl-2">
                              {isExamOpen ? <FolderOpen className="w-5 h-5 text-orange-500" /> : <Layers className="w-5 h-5 text-gray-400" />}
                              <div>
                                <span className="font-bold text-gray-800 text-sm block">{exam.title}</span>
                                {/* NEW: Subject Count Indicator */}
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                  {subjectCount} Subjects
                                </span>
                              </div>
                           </button>
                           
                           {/* Exam Actions */}
                           <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => setModal({ type: 'exam', mode: 'edit', data: exam, parentId: stream.id })} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                              <form action={deleteCourseAction}><input type="hidden" name="id" value={exam.id} /><button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button></form>
                              <button onClick={() => setModal({ type: 'subject', mode: 'create', parentId: exam.id })} className="ml-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-orange-200 flex items-center gap-1"><Plus className="w-3 h-3" /> Subject</button>
                           </div>
                        </div>

                        {/* LEVEL 3: SUBJECT LIST */}
                        {isExamOpen && (
                          <div className="bg-gray-50 p-3 space-y-2 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                             {subjectCount === 0 && <p className="text-xs text-gray-400 italic pl-10 py-2">No subjects yet.</p>}
                             
                             {exam.subjects?.map((sub) => (
                               <div key={sub.id} className="flex items-center justify-between pl-4 pr-2 py-2 bg-white ml-8 rounded-xl border border-gray-100 shadow-sm hover:border-blue-300 transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-purple-50 text-purple-600 rounded-md flex items-center justify-center shrink-0">
                                      <BookOpen className="w-3 h-3" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">{sub.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => setModal({ type: 'subject', mode: 'edit', data: sub, parentId: exam.id })} className="p-1.5 text-gray-300 hover:text-blue-600"><Pencil className="w-3 h-3" /></button>
                                    <form action={deleteSubjectAction}><input type="hidden" name="id" value={sub.id} /><button className="p-1.5 text-gray-300 hover:text-red-600"><Trash2 className="w-3 h-3" /></button></form>
                                  </div>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
           )
        })}
      </div>
    </div>
  )
}