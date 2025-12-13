import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Clock, Target, Calendar, ArrowRight, PlayCircle, Trophy } from 'lucide-react'

// Import the new School Component
import SchoolAdminOverview from '@/components/dashboard/school-overview'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')

  // 1. Fetch Profile & Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organization_id') // Ensure organization_id is fetched
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

  // =========================================================
  // 4. STUDENT VIEW (Existing Code Below)
  // =========================================================
  
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select(`
      *,
      exams (title),
      practice_tests (title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalTests = attempts?.length || 0
  
  const avgScore = totalTests > 0 
    ? Math.round(attempts!.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalTests)
    : 0

  const totalSeconds = attempts?.reduce((acc, curr) => acc + (curr.time_taken_seconds || 0), 0) || 0
  const hoursSpent = (totalSeconds / 3600).toFixed(1)

  const recentActivity = attempts?.slice(0, 3) || []

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name?.split(' ')[0]}!</h2>
          <p className="text-gray-500 mt-1">Here is your preparation summary.</p>
        </div>
        
        <Link 
          href="/categories" 
          className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
        >
          Browse Courses
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Tests Taken', value: totalTests, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg. Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Hours Spent', value: `${hoursSpent}h`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
           <Link href="/dashboard/exams" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
             View All <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">You haven't taken any tests yet.</p>
            <Link href="/categories" className="text-black font-bold hover:underline">Start a Test</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((attempt) => {
              const title = attempt.exams?.title || attempt.practice_tests?.title || 'Unknown Test'
              const isMock = !!attempt.exam_id
              const date = new Date(attempt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

              return (
                <div key={attempt.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMock ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                         {isMock ? <Trophy className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                           <span className="uppercase tracking-wider">{isMock ? 'Mock Test' : 'Practice'}</span>
                           <span>•</span>
                           <span>{date}</span>
                        </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold text-gray-900">{attempt.score}/{attempt.total_marks}</div>
                        <div className="text-xs font-bold text-gray-400">Score</div>
                      </div>
                   </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}