import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Library, BookOpen } from 'lucide-react'
import { deleteSubjectAction } from './actions'

export default async function SubjectsAdminPage() {
  const supabase = await createClient()
  
  // Fetch subjects and join with courses table to get course title
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*, courses(title)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subjects</h1>
          <p className="text-gray-500">Manage subjects across all courses.</p>
        </div>
        <Link 
          href="/dashboard/admin/subjects/new" 
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </Link>
      </div>

      <div className="grid gap-4">
        {(!subjects || subjects.length === 0) ? (
          <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400 font-medium">No subjects found. Add one to get started.</p>
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject.id} className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-center group hover:border-blue-400 transition-all shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                  <Library className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{subject.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                      <BookOpen className="w-3 h-3" /> 
                      {/* @ts-ignore */}
                      {subject.courses?.title || 'Unknown Course'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <Link 
                   href={`/dashboard/admin/subjects/${subject.id}/edit`} 
                   className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                 >
                   <Pencil className="w-5 h-5" />
                 </Link>
                 <form action={deleteSubjectAction}>
                   <input type="hidden" name="id" value={subject.id} />
                   <button 
                     type="submit" 
                     className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                 </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}