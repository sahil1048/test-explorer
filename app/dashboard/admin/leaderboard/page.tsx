import { createClient } from '@/lib/supabase/server'
import LeaderboardClient from '@/components/dashboard/leaderboard-client'

export default async function AdminLeaderboardPage() {
  const supabase = await createClient()

  // Fetch Courses for the first dropdown
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title')

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Global Leaderboard</h1>
        <p className="text-gray-500 mt-2">View top performers by Course and Subject.</p>
      </div>

      <LeaderboardClient courses={courses || []} />
    </div>
  )
}