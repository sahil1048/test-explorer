'use client'

import { useState } from 'react'
import { Plus, X, Save, Layers, BookOpen, Loader2 } from 'lucide-react'
import { createBlueprintAction } from '@/app/dashboard/admin/blueprints/actions'
import { toast } from 'sonner'

export default function BlueprintCreator({ courses }: { courses: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // Derive subjects based on selected course
  const selectedCourse = courses.find(c => c.id === selectedCourseId)
  const subjects = selectedCourse?.subjects || []

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      await createBlueprintAction(formData)
      toast.success("Blueprint created successfully!")
      setIsOpen(false)
      setSelectedCourseId("") 
    } catch (error: any) {
      toast.error(error.message || "Failed to create blueprint")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
      >
        <Plus className="w-4 h-4" /> Create Blueprint
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-2xl font-black text-gray-900 mb-6">New Mock Pattern</h2>

            <form action={handleSubmit} className="space-y-6">
              
              {/* 1. Course Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Course (Exam)</label>
                <div className="relative">
                  <select 
                    name="course_id" 
                    required
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-black outline-none font-medium"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <Layers className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {selectedCourseId && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-6">
                  
                  {/* 2. Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Blueprint Title</label>
                      <input name="title" placeholder="e.g. JEE Main Full Syllabus" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Mins</label>
                          <input name="duration" type="number" defaultValue={180} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Marks</label>
                          <input name="marks" type="number" defaultValue={300} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
                       </div>
                    </div>
                  </div>

                  {/* 3. Subject Distribution */}
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Question Distribution
                    </h3>
                    
                    {subjects.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No subjects found in this course.</p>
                    ) : (
                      <div className="space-y-3">
                        {subjects.map((sub: any) => (
                          <div key={sub.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <span className="font-bold text-gray-700 text-sm">{sub.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 font-bold uppercase">Questions:</span>
                              <input 
                                type="number" 
                                name={`subject_count_${sub.id}`} 
                                placeholder="0"
                                min="0"
                                className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 text-center font-bold focus:ring-2 focus:ring-black outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Blueprint
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      )}
    </>
  )
}