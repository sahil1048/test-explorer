import { createClient } from '@/lib/supabase/server'
import { updateExamAction } from '../../actions'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import QuestionsList from './questions-list' // <--- Import the new component

export default async function EditExamPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ type: string }> 
}) {
  const supabase = await createClient()
  const { id } = await params
  const { type } = await searchParams
  
  const validTypes = ['prep', 'mock', 'practice']
  const currentType = validTypes.includes(type) ? type : 'prep'

  // 1. Fetch Exam Data
  let table = 'prep_modules'
  let questionFK = 'module_id' // Default foreign key column name

  if (currentType === 'mock') {
    table = 'exams'
    questionFK = 'exam_id'
  } else if (currentType === 'practice') {
    table = 'practice_tests'
    questionFK = 'practice_test_id'
  }

  const { data: item } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single()

  if (!item) return notFound()

  // 2. Fetch Existing Questions for this Exam
  const { data: questions } = await supabase
    .from('questions')
    .select('id, text, order_index')
    .eq(questionFK, id)
    .order('order_index', { ascending: true })

  // 3. Fetch Subjects for Dropdown
  const { data: subjects } = await supabase.from('subjects').select('id, title').order('title')

  return (
    <div className="max-w-7xl mx-auto py-8">
      <Link href="/dashboard/admin/exams" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      
      <div className="grid lg:grid-cols-8 gap-8">
        
        {/* LEFT COLUMN: Edit Form */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-gray-900">Edit {currentType}</h1>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-md tracking-widest">{currentType}</span>
            </div>

            <form action={updateExamAction} className="space-y-6">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="type" value={currentType} />

              {/* ... (Existing inputs for Title, Subject, Description, Duration) ... */}
              {/* COPY YOUR EXISTING INPUT FIELDS HERE FROM THE PREVIOUS EDIT PAGE CODE */}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
                  <input name="title" defaultValue={item.title} type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                  <select name="subject_id" defaultValue={item.subject_id} required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white">
                    <option value="">Select Subject</option>
                    {subjects?.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                <textarea name="description" defaultValue={item.description} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
              </div>

              {currentType !== 'prep' && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Duration (Minutes)</label>
                  <input name="duration" type="number" defaultValue={item.duration_minutes} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
                </div>
              )}

              {/* CSV Upload Section */}
              <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
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
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" name="is_published" id="pub" defaultChecked={item.is_published} className="w-5 h-5 accent-black" />
                <label htmlFor="pub" className="text-sm font-medium text-gray-700">Publish immediately</label>
              </div>

              <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Questions List */}
        <div className="lg:col-span-3">
           <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm sticky top-8">
              <QuestionsList questions={questions || []} examId={item.id} />
           </div>
        </div>

      </div>
    </div>
  )
}