// components/admin/blueprint-creator.tsx

'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Save, Layers, BookOpen, Loader2, Pencil } from 'lucide-react'
import { createBlueprintAction, updateBlueprintAction } from '@/app/dashboard/admin/blueprints/actions'
import { toast } from 'sonner'

interface BlueprintModalProps {
  courses: any[]
  blueprint?: any // If provided, we are in EDIT mode
}

export default function BlueprintModal({ courses, blueprint }: BlueprintModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditMode = !!blueprint
  const [selectedCourseId, setSelectedCourseId] = useState<string>(blueprint?.course_id || "")
  const [loading, setLoading] = useState(false)

  const selectedCourse = courses.find(c => c.id === selectedCourseId)
  const subjects = selectedCourse?.subjects || []

  useEffect(() => {
    if (isOpen && blueprint) {
      setSelectedCourseId(blueprint.course_id)
    } else if (isOpen && !blueprint) {
      setSelectedCourseId("")
    }
  }, [isOpen, blueprint])

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      let res;
      if (isEditMode) {
        formData.append('id', blueprint.id)
        res = await updateBlueprintAction(formData)
      } else {
        res = await createBlueprintAction(formData)
      }
      
      if (res?.error) throw new Error(res.error)
      
      const count = res.generatedCount || 0
      const actionMsg = isEditMode ? "updated" : "created"
      
      if (count > 0) {
        toast.success(`Blueprint ${actionMsg} & ${count} mock tests generated!`)
      } else {
        toast.error(`Blueprint ${actionMsg} (No available questions for new mocks)`)
      }
      
      setIsOpen(false)
      if (!isEditMode) setSelectedCourseId("") 
    } catch (error: any) {
      toast.error(error.message || "Operation failed")
    } finally {
      setLoading(false)
    }
  }

  const getExistingCount = (subjectId: string) => {
    if (!blueprint?.items) return 0
    const item = blueprint.items.find((i: any) => i.subject_id === subjectId)
    return item ? item.question_count : 0
  }

  return (
    <>
      {isEditMode ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          title="Edit Blueprint"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> Create Blueprint
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-2xl font-black text-gray-900 mb-6">
              {isEditMode ? 'Edit Blueprint' : 'New Mock Pattern'}
            </h2>

            <form action={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Course (Exam)</label>
                <div className="relative">
                  <select 
                    name="course_id" 
                    required
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    disabled={isEditMode} 
                    className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-black outline-none font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <Layers className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {isEditMode && <p className="text-xs text-gray-400 mt-1 ml-1">Course cannot be changed while editing.</p>}
              </div>

              {selectedCourseId && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Blueprint Title</label>
                      <input 
                        name="title" 
                        defaultValue={blueprint?.title || ''}
                        placeholder="e.g. JEE Main Full Syllabus" 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" 
                      />
                    </div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  {/* Duration */}
  <div>
    <label className="block text-xs font-bold text-gray-700 mb-1">Duration (mins)</label>
    <input 
      name="duration" 
      type="number" 
      required
      defaultValue={blueprint?.total_duration_minutes || 60}
      className="w-full border rounded p-2 text-sm"
    />
  </div>

  {/* Total Marks */}
  <div>
    <label className="block text-xs font-bold text-gray-700 mb-1">Total Marks</label>
    <input 
      name="marks" 
      type="number" 
      required
      defaultValue={blueprint?.total_marks || 100}
      className="w-full border rounded p-2 text-sm"
    />
  </div>

  {/* ✅ NEW: Correct Answer Marks */}
  <div>
    <label className="block text-xs font-bold text-green-700 mb-1">Correct (+)</label>
    <input 
      name="marks_correct" 
      type="number" 
      step="0.25"
      defaultValue={4} // Or blueprint?.marks_correct if you added it to blueprints
      className="w-full border border-green-200 bg-green-50 rounded p-2 text-sm"
    />
  </div>

  {/* ✅ NEW: Incorrect Answer Marks */}
  <div>
    <label className="block text-xs font-bold text-red-700 mb-1">Incorrect (-)</label>
    <input 
      name="marks_incorrect" 
      type="number" 
      step="0.25"
      defaultValue={-1} // Or blueprint?.marks_incorrect
      className="w-full border border-red-200 bg-red-50 rounded p-2 text-sm"
    />
  </div>
</div>

{/* Hidden input for Unattempted (usually 0, so maybe hide it or show cleanly) */}
<input type="hidden" name="marks_unattempted" value="0" />
                  </div>

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
                                defaultValue={getExistingCount(sub.id)}
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
                    {isEditMode ? 'Update & Auto-Generate' : 'Save & Auto-Generate'}
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