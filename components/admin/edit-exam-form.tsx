'use client'

import { useState, useEffect } from 'react'
import { updateExamAction } from '@/app/dashboard/admin/exams/actions'
import { Save, Upload, Layers, FolderOpen, BookOpen } from 'lucide-react'

// Define Hierarchy Types
type Subject = { id: string; title: string }
type Course = { id: string; title: string; subjects: Subject[] }
type Stream = { id: string; title: string; courses: Course[] }

interface EditExamFormProps {
  streams: Stream[]
  item: any
  type: string
}

export default function EditExamForm({ streams, item, type }: EditExamFormProps) {
  // --- STATE ---
  const [selectedStreamId, setSelectedStreamId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  // item.subject_id might be undefined if data is partial, handle safely
  const [selectedSubjectId, setSelectedSubjectId] = useState(item.subject_id || '')

  // --- REVERSE LOOKUP: Find Stream & Course from Subject ID ---
  useEffect(() => {
    if (item.subject_id && streams) {
      for (const stream of streams) {
        if (stream.courses) {
          for (const course of stream.courses) {
            if (course.subjects) {
              const foundSubject = course.subjects.find(s => s.id === item.subject_id)
              if (foundSubject) {
                setSelectedStreamId(stream.id)
                setSelectedCourseId(course.id)
                return // Stop searching once found
              }
            }
          }
        }
      }
    }
  }, [item.subject_id, streams])

  // --- FILTERING LOGIC ---
  const filteredCourses = streams.find(s => s.id === selectedStreamId)?.courses || []
  const filteredSubjects = filteredCourses.find(c => c.id === selectedCourseId)?.subjects || []

  return (
    <form action={updateExamAction} className="space-y-6">
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="type" value={type} />

      {/* --- HIERARCHY SECTION --- */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Hierarchy Selection</h3>
        
        <div className="space-y-4">
          {/* 1. Stream Select */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Stream
            </label>
            <select 
              value={selectedStreamId}
              onChange={(e) => {
                setSelectedStreamId(e.target.value)
                setSelectedCourseId('') // Reset child
                setSelectedSubjectId('')
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white cursor-pointer text-sm"
            >
              <option value="">-- Select Stream --</option>
              {streams.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 2. Exam Select */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <FolderOpen className="w-3 h-3" /> Exam (Course)
              </label>
              <select 
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value)
                  setSelectedSubjectId('')
                }}
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

            {/* 3. Subject Select (Final Target) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Subject
              </label>
              <select 
                name="subject_id" 
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
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

      {/* --- NORMAL FIELDS --- */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
        <input name="title" defaultValue={item.title} type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
        <textarea name="description" defaultValue={item.description} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
      </div>

      {type !== 'prep' && (
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Duration (Minutes)</label>
          <input name="duration" type="number" defaultValue={item.duration_minutes} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
        </div>
      )}

      {/* CSV Upload Section */}
      {/* <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
        <h3 className="text-orange-900 font-bold mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Add Questions (CSV)
        </h3>
        <p className="text-xs text-orange-700/80 mb-4">
          New questions will be appended. Use the list on the right to delete old ones.
        </p>
        <input 
          type="file" 
          name="csv_file" 
          accept=".csv"
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
        />
      </div> */}

      <div className="flex items-center gap-3 pt-2">
        <input type="checkbox" name="is_published" id="pub" defaultChecked={item.is_published} className="w-5 h-5 accent-black" />
        <label htmlFor="pub" className="text-sm font-medium text-gray-700">Publish immediately</label>
      </div>

      <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </form>
  )
}