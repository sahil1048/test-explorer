import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContentGenerator from '@/components/admin/content-generator'
import CsvUploadModal from '@/components/admin/csv-upload-modal' // <--- Import New Component

export default async function SubjectManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  
  // 1. Fetch Subject
  const { data: subject } = await supabase
    .from('subjects')
    .select('title')
    .eq('id', id)
    .single()

  if (!subject) return notFound()

  // 2. Fetch Stats (ROBUST METHOD)
  
  // A. Total Pool Size
  const { data: banks } = await supabase
    .from('question_banks')
    .select('id')
    .eq('subject_id', id)

  const bankIds = banks?.map(b => b.id) || []
  let questionCount = 0

  if (bankIds.length > 0) {
    const { count } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .in('question_bank_id', bankIds)
    
    questionCount = count || 0
  }

  // B. Generated Counts
  const { count: prepCount } = await supabase.from('prep_modules').select('id', { count: 'exact', head: true }).eq('subject_id', id)
  const { count: practiceCount } = await supabase.from('practice_tests').select('id', { count: 'exact', head: true }).eq('subject_id', id)
  const { count: mockCount } = await supabase.from('exams').select('id', { count: 'exact', head: true }).eq('subject_id', id).eq('category', 'mock')

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <Link href="/dashboard/admin/manage-content" className="flex items-center gap-2 text-gray-400 font-bold mb-2 hover:text-black text-xs uppercase tracking-wider">
            <ArrowLeft className="w-3 h-3" /> Back to Content Manager
          </Link>
          <h1 className="text-3xl font-black text-gray-900">{subject.title}</h1>
          <p className="text-gray-500 font-medium">Automatic Content Generation</p>
        </div>
        
        {/* --- REPLACED LINK WITH MODAL --- */}
        <CsvUploadModal subjectId={id} subjectTitle={subject.title} />

      </div>

      {/* Generator Dashboard */}
      <ContentGenerator 
        subjectId={id} 
        questionCount={questionCount || 0}
        counts={{
          prep: prepCount || 0,
          practice: practiceCount || 0,
          mock: mockCount || 0
        }}
      />
      
      {/* Help */}
      <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-2">How Generation Works</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
          <li><strong>Source of Truth:</strong> Content is generated from the <strong>Question Pool</strong>. Upload CSVs to populate it.</li>
          <li><strong>Prep Modules:</strong> Randomly chunks the pool into sets of 10 for learning mode.</li>
          <li><strong>Practice Tests:</strong> Randomly chunks the pool into sets of 20 (timed).</li>
          <li><strong>Mock Exams:</strong> Randomly chunks the pool into sets of 50 (timed, high stakes).</li>
          <li><strong>Regeneration:</strong> Clicking "Generate" again will <strong>delete</strong> existing sets and reshuffle.</li>
        </ul>
      </div>

    </div>
  )
}