import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import QuestionsList from './questions-list'
import EditExamForm from '@/components/admin/edit-exam-form' // Import new component

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
  let questionFK = 'module_id'

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

  // 3. Fetch Full Hierarchy for Dropdown (Streams -> Courses -> Subjects)
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
          title
        )
      )
    `)
    .order('title')

  return (
    <div className="max-w-7xl mx-auto py-8">
      <Link href="/dashboard/admin/exams" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      
      <div className="grid lg:grid-cols-8 gap-8">
        
        {/* LEFT COLUMN: Edit Form (Client Component) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black text-gray-900">Edit {currentType}</h1>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase rounded-md tracking-widest">{currentType}</span>
            </div>

            {/* Render the Client Form with Hierarchy Data */}
            {/* @ts-ignore */}
            <EditExamForm streams={streams || []} item={item} type={currentType} />
            
          </div>
        </div>

        {/* RIGHT COLUMN: Questions List */}
        <div className="lg:col-span-3">
           <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm sticky top-8">
              <QuestionsList questions={questions || []} examId={item.id} examType={currentType} />
           </div>
        </div>

      </div>
    </div>
  )
}