'use client'

import { useState } from 'react'
import { updateSubjectAction } from '@/app/dashboard/admin/subjects/actions'
import { Save } from 'lucide-react'

type Stream = { id: string; title: string }
type Course = { id: string; title: string; category_id: string }

interface EditSubjectFormProps {
  streams: Stream[]
  courses: Course[]
  subject: {
    id: string
    title: string
    course_id: string
    courses: {
      category_id: string
    } | null // Relation data from Supabase
  }
}

export default function EditSubjectForm({ streams, courses, subject }: EditSubjectFormProps) {
  // 1. Initialize Stream Selection based on existing data
  // We use optional chaining because relation data might be missing
  const initialStreamId = subject.courses?.category_id || ''
  const [selectedStreamId, setSelectedStreamId] = useState<string>(initialStreamId)

  // 2. Filter exams based on the selected stream
  const filteredCourses = courses.filter(
    (course) => course.category_id === selectedStreamId
  )

  return (
    <form action={updateSubjectAction} className="space-y-6">
      <input type="hidden" name="id" value={subject.id} />

      {/* Stream Selection (Filter) */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Select Stream</label>
        <div className="relative">
          <select 
            value={selectedStreamId}
            onChange={(e) => setSelectedStreamId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer"
          >
            <option value="">-- Choose a Stream --</option>
            {streams.map((stream) => (
              <option key={stream.id} value={stream.id}>
                {stream.title}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            ▼
          </div>
        </div>
      </div>

      {/* Exam Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Assign to Exam</label>
        <div className="relative">
          <select 
            name="course_id" 
            defaultValue={subject.course_id}
            required
            key={selectedStreamId} // Force re-render when stream changes to reset/update dropdown
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer"
          >
            <option value="">Select an Exam</option>
            {filteredCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            ▼
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Subject Title</label>
        <input 
          name="title" 
          defaultValue={subject.title} 
          type="text" 
          required 
          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" 
        />
      </div>

      <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </form>
  )
}