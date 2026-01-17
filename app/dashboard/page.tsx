import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Components
import SchoolAdminOverview from '@/components/dashboard/school-overview'
import StudentOverview from '@/components/dashboard/student-overview'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')

  // 1. Fetch Profile & Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organization_id')
    .eq('id', user.id)
    .single()

  // 2. Redirect Super Admin
  if (profile?.role === 'super_admin') {
    redirect('/dashboard/admin')
  }

  // 3. SHOW SCHOOL ADMIN VIEW
  if (profile?.role === 'school_admin') {
    return <SchoolAdminOverview profile={profile} />
  }

  // 4. STUDENT VIEW
  // Fetch specific student data here to pass down
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select(`
      *,
      exams (title),
      practice_tests (title),
      mock_tests (title)
    `)
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })

  return <StudentOverview profile={profile} attempts={attempts || []} />
}