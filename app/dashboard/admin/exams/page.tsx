import { createClient } from '@/lib/supabase/server'
import ExamsClient from './exams-client'

export default async function ExamsAdminPage() {
  const supabase = await createClient()

  // Parallel Fetching for all 3 types
  const [prepRes, mockRes, practiceRes] = await Promise.all([
    supabase.from('prep_modules').select('*, subjects(title)').order('created_at', { ascending: false }),
    supabase.from('exams').select('*, subjects(title)').eq('category', 'mock').order('created_at', { ascending: false }),
    supabase.from('practice_tests').select('*, subjects(title)').order('created_at', { ascending: false })
  ])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exam Management</h1>
        <p className="text-gray-500">Manage all testing content: Prep Modules, Mocks, and Practice Tests.</p>
      </div>

      <ExamsClient 
        prepModules={prepRes.data || []}
        mockTests={mockRes.data || []}
        practiceTests={practiceRes.data || []}
      />
    </div>
  )
}