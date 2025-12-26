import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import CreateExamForm from '@/components/admin/create-exam-form' // Import the new client component

export default async function NewExamPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ type: string }> 
}) {
  const supabase = await createClient()
  const { type } = await searchParams
  const validTypes = ['prep', 'mock', 'practice']
  const currentType = validTypes.includes(type) ? type : 'prep'

  // Fetch full hierarchy: Categories (Streams) -> Courses (Exams) -> Subjects
  // This allows the client component to filter subjects based on selected exam/stream
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
    <div className="max-w-3xl mx-auto py-8">
      <Link href="/dashboard/admin/exams" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Exams
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
           <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase rounded-md tracking-widest">{currentType}</span>
           <h1 className="text-2xl font-black text-gray-900">Create New Entry</h1>
        </div>

        {/* Pass data to the Client Component */}
        {/* @ts-ignore - Supabase type inference for nested arrays can be loose */}
        <CreateExamForm streams={streams || []} type={currentType} />
        
      </div>
    </div>
  )
}