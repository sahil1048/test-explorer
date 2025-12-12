import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Building2, 
  Users, 
  BookOpen, 
  Plus, 
  ArrowUpRight 
} from 'lucide-react'

export default async function SuperAdminDashboard() {
  const supabase = await createClient()

  // Fetch High-Level Stats (Parallel)
  const [schools, students, courses] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
    supabase.from('courses').select('id', { count: 'exact' })
  ])

  const stats = [
    { label: 'Active Schools', value: schools.count || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/admin/schools' },
    { label: 'Total Students', value: students.count || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/admin/users' },
    { label: 'Courses', value: courses.count || 0, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50', link: '/dashboard/admin/courses' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Admin</h1>
          <p className="text-gray-500 font-medium">Manage your SaaS ecosystem.</p>
        </div>
        <Link 
          href="/dashboard/admin/schools/new" 
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Onboard School
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.link} className="group block">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-black transition-colors relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-4xl font-black text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-bold text-gray-500">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section (Placeholder) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Onboardings</h3>
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 font-medium">
          No recent activity logs found.
        </div>
      </div>
    </div>
  )
}