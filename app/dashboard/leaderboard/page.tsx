import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LeaderboardClient from '@/components/dashboard/leaderboard-client'

export default async function SchoolLeaderboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const schoolId = profile?.organization_id

  if (!schoolId) {
    return <div className="p-8">Access Restricted: You are not linked to a school.</div>
  }

  // Fetch Courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title')

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">School Leaderboard</h1>
        <p className="text-gray-500 mt-2">Top performers within your institute.</p>
      </div>

      <LeaderboardClient 
        courses={courses || []} 
        schoolId={schoolId} 
      />
    </div>
  )
}