import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Clock, Target, Calendar } from 'lucide-react'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')

  // Example: Fetch generic stats (You'll replace this with real query counts later)
  const stats = [
    { label: 'Tests Taken', value: '0', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Score', value: '0%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Hours Spent', value: '0h', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Progress</h2>
          <p className="text-gray-500 mt-1">Welcome back, keep pushing your limits!</p>
        </div>
        <Link 
          href="/courses" 
          className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
        >
          Browse Courses
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
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

      {/* Recent Activity / Empty State */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No Recent Activity</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">
          You haven't taken any tests yet. Go to the courses section to start your first exam.
        </p>
        <Link href="/courses" className="text-blue-600 font-semibold hover:underline">
          Find a Test &rarr;
        </Link>
      </div>
    </div>
  )
}