'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createExamAction } from '@/app/dashboard/admin/exams/actions' // Adjust path if needed
import { Upload, Save, Layers, FolderOpen, BookOpen, Loader2 } from 'lucide-react'

// Define types for the hierarchy
type Subject = { id: string; title: string }
type Course = { id: string; title: string; subjects: Subject[] }
type Stream = { id: string; title: string; courses: Course[] }

interface CreateExamFormProps {
  streams: Stream[]
  type: string
}

export default function CreateExamForm({ streams, type }: CreateExamFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [selectedStreamId, setSelectedStreamId] = useState<string>('')
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')

  // 1. Filter Courses based on Stream
  const filteredCourses = streams.find(s => s.id === selectedStreamId)?.courses || []

  // 2. Filter Subjects based on Course
  const filteredSubjects = filteredCourses.find(c => c.id === selectedCourseId)?.subjects || []

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    const formData = new FormData(event.currentTarget)
    
    const result = await createExamAction(formData)

    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Exam created successfully')
      router.push('/dashboard/admin/exams')
      router.refresh()
    }
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="type" value={type} />

      {/* --- HIERARCHY SELECTION --- */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Hierarchy Selection</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* 1. Stream Select */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Stream
            </label>
            <div className="relative">
              <select 
                value={selectedStreamId}
                onChange={(e) => {
                  setSelectedStreamId(e.target.value)
                  setSelectedCourseId('') // Reset child
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer text-sm"
              >
                <option value="">-- Select Stream --</option>
                {streams.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Exam Select */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <FolderOpen className="w-3 h-3" /> Exam (Course)
            </label>
            <div className="relative">
              <select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={!selectedStreamId}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {!selectedStreamId ? 'Select Stream First' : '-- Select Exam --'}
                </option>
                {filteredCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Subject Select (Final Target) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Subject
            </label>
            <div className="relative">
              <select 
                name="subject_id" 
                required
                disabled={!selectedCourseId}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">
                  {!selectedCourseId ? 'Select Exam First' : '-- Select Subject --'}
                </option>
                {filteredSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- BASIC INFO --- */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
        <input name="title" type="text" placeholder="e.g. Algebra Basics" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
        <textarea name="description" rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
      </div>

      {/* Duration (Only for non-prep) */}
      {type !== 'prep' && (
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Duration (Minutes)</label>
          <input name="duration" type="number" defaultValue="60" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
        </div>
      )}

      <div className="h-px bg-gray-100 my-2" />

      {/* CSV Upload */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
        <h3 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Bulk Upload Questions
        </h3>
        <p className="text-sm text-blue-700/80 mb-4">
          Upload a CSV file with columns: <strong>Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation, Direction</strong>.
        </p>
        <input 
          type="file" 
          name="csv_file" 
          accept=".csv"
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
          "
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
         <input type="checkbox" name="is_published" id="pub" className="w-5 h-5 accent-black" />
         <label htmlFor="pub" className="text-sm font-medium text-gray-700">Publish immediately</label>
      </div>

      <button type="submit" disabled={isPending} className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create & Upload
      </button>
    </form>
  )
}