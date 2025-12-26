import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Layers, BookOpen, GraduationCap } from 'lucide-react'
import { deleteCourseAction } from './actions'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default async function CoursesAdminPage() {
  const supabase = await createClient()

  // Fetch Streams (Categories) with nested Exams (Courses)
  const { data: streams } = await supabase
    .from('categories')
    .select(`
      id, 
      title,
      courses (
        id, 
        title, 
        description, 
        is_published, 
        created_at
      )
    `)
    .order('order_index', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exams Manager</h1>
          <p className="text-gray-500">Manage entrance exams grouped by stream.</p>
        </div>
        <Link 
          href="/dashboard/admin/courses/new" 
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Exam
        </Link>
      </div>

      {/* Structured Layout */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {(!streams || streams.length === 0) ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Layers className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 font-medium">No streams found.</p>
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
                        {stream.courses?.length || 0} Exams Available
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                {/* Exams Grid (Accordion Content) */}
                <AccordionContent className="pb-8 pt-2">
                  {(!stream.courses || stream.courses.length === 0) ? (
                     <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 italic text-sm">No exams created under this stream yet.</p>
                     </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stream.courses
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort Newest First
                        .map((course) => (
                        <div key={course.id} className="bg-white p-5 rounded-2xl border border-gray-200 group hover:border-black transition-all shadow-sm flex flex-col h-full">
                          
                          <div className="flex justify-between items-start mb-4">
                             <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                <GraduationCap className="w-5 h-5" />
                             </div>
                             <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {course.is_published ? 'Published' : 'Draft'}
                             </span>
                          </div>

                          <div className="mb-4 flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{course.title}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2">{course.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-auto">
                             <Link 
                               href={`/dashboard/admin/courses/${course.id}/edit`} 
                               className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                               title="Edit Exam"
                             >
                               <Pencil className="w-4 h-4" />
                             </Link>
                             <form action={deleteCourseAction}>
                               <input type="hidden" name="id" value={course.id} />
                               <button 
                                 type="submit" 
                                 className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                 title="Delete Exam"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}