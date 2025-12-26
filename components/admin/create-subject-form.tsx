'use client'

import { useState } from 'react'
import { createSubjectAction } from '@/app/dashboard/admin/subjects/actions' // Adjust path if needed
import { Save } from 'lucide-react'

type Stream = { id: string; title: string }
type Course = { id: string; title: string; category_id: string }

interface CreateSubjectFormProps {
  streams: Stream[]
  courses: Course[]
}

export default function CreateSubjectForm({ streams, courses }: CreateSubjectFormProps) {
  const [selectedStreamId, setSelectedStreamId] = useState<string>('')

  // Filter exams (courses) based on the selected stream (category)
  const filteredCourses = courses.filter(
    (course) => course.category_id === selectedStreamId
  )

  return (
    <form action={createSubjectAction} className="space-y-6">
      
      {/* 1. Stream Selection (Filter) */}
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

      {/* 2. Exam Selection (Actual Data) */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Assign to Exam</label>
        <div className="relative">
          <select 
            name="course_id" 
            required
            disabled={!selectedStreamId}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {!selectedStreamId ? 'Select a Stream first' : 'Select an Exam'}
            </option>
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

      {/* 3. Title Input */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Subject Title</label>
        <input 
          name="title" 
          type="text" 
          placeholder="e.g. Organic Chemistry" 
          required 
          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" 
        />
      </div>

      <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
        <Save className="w-4 h-4" /> Create Subject
      </button>
    </form>
  )
}