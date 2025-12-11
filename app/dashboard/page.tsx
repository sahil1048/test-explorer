import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardHome() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Redirect based on Role
  switch (profile?.role) {
    case 'student':
      return redirect('/dashboard/exams')
    case 'school_admin':
      return redirect('/dashboard/school-settings')
    case 'super_admin':
      return redirect('/dashboard/admin')
    default:
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-red-600">Access Error</h2>
          <p>Your account does not have a valid role assigned.</p>
        </div>
      )
  }
}