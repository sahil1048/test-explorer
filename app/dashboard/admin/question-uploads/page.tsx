import { createClient } from '@/lib/supabase/server'
import { UploadCloud } from 'lucide-react'
import SubjectUploader from '@/components/admin/subject-uploader'

export default async function QuestionUploadsPage() {
  const supabase = await createClient()

  // Fetch Hierarchy with Question Bank Counts
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
          question_banks (count)
        )
      )
    `)
    .order('title')

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Question Uploads</h1>
          <p className="text-gray-500 font-medium">Select a subject to bulk upload questions into the Pool.</p>
        </div>
      </div>

      <SubjectUploader streams={streams || []} />
    </div>
  )
}