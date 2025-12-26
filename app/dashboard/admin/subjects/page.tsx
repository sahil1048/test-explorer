import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Library, BookOpen, Layers, FolderOpen } from 'lucide-react'
import { deleteSubjectAction } from './actions'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default async function SubjectsAdminPage() {
  const supabase = await createClient()
  
  // Fetch hierarchical data: Categories -> Courses -> Subjects
  const { data: streams } = await supabase
    .from('categories')
    .select(`
      id, 
      title,
      courses (
        id, 
        title,
        subjects (
          id, 
          title,
          created_at
        )
      )
    `)
    .order('order_index', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subjects Manager</h1>
          <p className="text-gray-500">Organized by Stream & Exam</p>
        </div>
        <Link 
          href="/dashboard/admin/subjects/new" 
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </Link>
      </div>

      {/* Structured Layout */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {(!streams || streams.length === 0) ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Layers className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium">No streams or content found.</p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {streams.map((stream) => (
              <AccordionItem key={stream.id} value={stream.id} className="border-b last:border-0 px-6">
                
                {/* Stream Header (Accordion Trigger) */}
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-900">{stream.title}</h3>
                      <p className="text-sm text-gray-400 font-medium">
                        {stream.courses?.length || 0} Exams
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                {/* Exams List (Accordion Content) */}
                <AccordionContent className="pb-8 pt-2">
                  <div className="grid md:grid-cols-2 gap-6">
                    {stream.courses?.map((course) => (
                      <div key={course.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        
                        {/* Exam Header */}
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200/50">
                           <FolderOpen className="w-4 h-4 text-gray-500" />
                           <h4 className="font-bold text-gray-800">{course.title}</h4>
                        </div>

                        {/* Subject List */}
                        {(!course.subjects || course.subjects.length === 0) ? (
                            <p className="text-sm text-gray-400 italic py-2">No subjects assigned yet.</p>
                        ) : (
                            <div className="space-y-2">
                              {course.subjects
                                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by newest
                                .map((subject) => (
                                <div key={subject.id} className="group bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
                                  
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                      <BookOpen className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm">{subject.title}</span>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    <Link 
                                      href={`/dashboard/admin/subjects/${subject.id}/edit`}
                                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                      title="Edit Subject"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Link>
                                    <form action={deleteSubjectAction}>
                                      <input type="hidden" name="id" value={subject.id} />
                                      <button 
                                        type="submit"
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete Subject"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </form>
                                  </div>

                                </div>
                              ))}
                            </div>
                        )}
                      </div>
                    ))}
                    
                    {(!stream.courses || stream.courses.length === 0) && (
                       <div className="col-span-full py-4 text-center text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          No exams found under this stream.
                       </div>
                    )}
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