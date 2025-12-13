import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AssignSubjectsForm from './assign-form'

export default async function AssignPage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()
  
  // 1. Fetch Target Student
  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.userId)
    .single()

  if (!student) return <div className="p-8">Student not found</div>

  // 2. Fetch All Subjects with Course Info
  // We use specific typing in the client component to handle the array response
  const { data: subjects } = await supabase
    .from('subjects')
    .select(`
      id, 
      title,
      courses ( id, title )
    `)
    .order('title')

  // 3. Fetch Existing Enrollments
  const { data: existingEnrollments } = await supabase
    .from('student_enrollments')
    .select('subject_id')
    .eq('user_id', params.userId)

  const enrolledSubjectIds = existingEnrollments?.map(e => e.subject_id) || []

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/admin/users" className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
           <h1 className="text-2xl font-black text-gray-900">Manage Access</h1>
           <p className="text-gray-500 font-medium">Assigning subjects to <span className="text-black">{student.full_name}</span></p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-4xl border border-gray-200 shadow-sm">
        <AssignSubjectsForm 
          studentId={params.userId}
          subjects={subjects || []}
          initialEnrollments={enrolledSubjectIds}
        />
      </div>
    </div>
  )
}