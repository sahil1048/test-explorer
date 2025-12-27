'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, BookOpen, Upload, X, FileText, Loader2, Database } from 'lucide-react'
import { uploadQuestionBankAction } from '@/app/dashboard/admin/question-uploads/actions'
import { toast } from 'sonner'

export default function SubjectUploader({ streams }: { streams: any[] }) {
  
  const [openStreams, setOpenStreams] = useState<Record<string, boolean>>({})
  const [openCourses, setOpenCourses] = useState<Record<string, boolean>>({})
  const [selectedSubject, setSelectedSubject] = useState<{id: string, title: string} | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleStream = (id: string) => setOpenStreams(p => ({ ...p, [id]: !p[id] }))
  const toggleCourse = (id: string) => setOpenCourses(p => ({ ...p, [id]: !p[id] }))

  return (
    <div className="space-y-6 pb-20">
      
      {/* HIERARCHY LIST */}
      <div className="grid gap-4">
        {streams.map((stream) => (
          <div key={stream.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Stream Header */}
            <button 
              onClick={() => toggleStream(stream.id)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${openStreams[stream.id] ? 'bg-blue-100 text-blue-600' : 'bg-white border text-gray-400'}`}>
                  {openStreams[stream.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
                <span className="font-bold text-lg text-gray-900">{stream.title}</span>
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stream.courses.length} Courses</span>
            </button>

            {/* Courses List */}
            {openStreams[stream.id] && (
              <div className="p-4 space-y-3">
                {stream.courses.map((course: any) => (
                  <div key={course.id} className="ml-4 border-l-2 border-gray-100 pl-4">
                    <button 
                      onClick={() => toggleCourse(course.id)}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-bold mb-2"
                    >
                      <Folder className="w-4 h-4 text-gray-400" />
                      {course.title}
                    </button>

                    {/* Subjects List */}
                    {openCourses[course.id] && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2 ml-2">
                        {course.subjects.map((subject: any) => (
                          <div key={subject.id} className="group flex flex-col justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all">
                            <div>
                              <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                {subject.title}
                              </div>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Database className="w-3 h-3" />
                                {subject.question_banks?.[0]?.count || 0} Batches Uploaded
                              </p>
                            </div>
                            
                            <button 
                              onClick={() => setSelectedSubject(subject)}
                              className="mt-4 w-full py-2 bg-black text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                            >
                              <Upload className="w-3 h-3" /> Upload to Pool
                            </button>
                          </div>
                        ))}
                        {course.subjects.length === 0 && <div className="text-xs text-gray-400 italic p-2">No subjects found.</div>}
                      </div>
                    )}
                  </div>
                ))}
                {stream.courses.length === 0 && <div className="text-sm text-gray-400 italic p-4">No courses available.</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* UPLOAD MODAL */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
            
            <button 
              onClick={() => setSelectedSubject(null)} 
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Upload to Question Pool</h2>
              <p className="text-gray-500 text-sm mt-1">
                Adding questions to subject: <span className="font-bold text-black">{selectedSubject.title}</span>
              </p>
            </div>

            <form 
              action={async (formData) => {
                setLoading(true)
                try {
                  await uploadQuestionBankAction(formData)
                  toast.success("Questions added to the subject pool!")
                  setSelectedSubject(null)
                } catch (error) {
                  toast.error("Upload failed. Check CSV format.")
                } finally {
                  setLoading(false)
                }
              }}
              className="space-y-4"
            >
              <input type="hidden" name="subject_id" value={selectedSubject.id} />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Batch Title</label>
                <input 
                  name="title" 
                  placeholder={`e.g. ${selectedSubject.title} - 2024 Question Bank`}
                  defaultValue={`${selectedSubject.title} Pool - ${new Date().toLocaleDateString()}`}
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  name="description" 
                  placeholder="Notes about this batch (e.g. source, difficulty)..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">CSV File</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer relative">
                  <Upload className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="text-xs font-bold text-gray-400">Click to browse CSV</span>
                  <input 
                    type="file" 
                    name="csv_file" 
                    accept=".csv"
                    required 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
                {/* UPDATED HELP TEXT */}
                <p className="text-[10px] text-gray-400 mt-2 bg-gray-100 p-2 rounded">
                  <strong>Required Columns:</strong> description, question, option_a, option_b, option_c, option_d, correct_option, explanation
                </p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload to Pool"}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}