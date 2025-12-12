import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Building2, 
  Users, 
  BookOpen, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  Activity
} from 'lucide-react'

export default async function SuperAdminDashboard() {
  const supabase = await createClient()

  // Fetch Stats (Parallel)
  const [schools, students, courses, subjects, exams] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
    supabase.from('courses').select('id', { count: 'exact' }),
    supabase.from('subjects').select('id', { count: 'exact' }),
    supabase.from('exams').select('id', { count: 'exact' })
  ])

  const stats = [
    { label: 'Total Schools', value: schools.count || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/admin/schools' },
    { label: 'Total Students', value: students.count || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/admin/users' },
    { label: 'Active Courses', value: courses.count || 0, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50', link: '/dashboard/admin/courses' },
    { label: 'Total Exams', value: exams.count || 0, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', link: '/dashboard/admin/exams' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Overview</h1>
          <p className="text-gray-500 font-medium">Welcome back, Super Admin.</p>
        </div>
        <div className="flex gap-3">
            <Link 
            href="/dashboard/admin/schools/new" 
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
            <Plus className="w-4 h-4" /> School
            </Link>
            <Link 
            href="/dashboard/admin/courses/new" 
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
            >
            <Plus className="w-4 h-4" /> Course
            </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.link} className="group block">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-black transition-all relative overflow-hidden h-full">
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

      {/* Graphs & Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Simple Growth Graph (CSS Only) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Student Activity</h3>
                    <p className="text-sm text-gray-500">Exams taken over the last 6 months</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg font-bold">
                    <TrendingUp className="w-4 h-4" /> +12.5%
                </div>
            </div>
            
            {/* CSS Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
                {[40, 65, 45, 80, 55, 90].map((h, i) => (
                    <div key={i} className="w-full bg-blue-50 rounded-t-xl relative group transition-all hover:bg-blue-100">
                        <div 
                            style={{ height: `${h}%` }} 
                            className="absolute bottom-0 w-full bg-blue-600 rounded-t-xl transition-all duration-500 group-hover:bg-blue-700"
                        >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                                {h * 10}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
        </div>

        {/* Quick Details / Tasks */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">System Health</h3>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-gray-600">Database Status</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-gray-600">Storage</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">45% Used</span>
                </div>
                
                <div className="h-px bg-gray-100 my-4" />
                
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Pending Actions</h4>
                <div className="space-y-3">
                    {[1,2].map((_,i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-gray-300 transition-all">
                             <div className="text-sm font-medium text-gray-700">New School Request</div>
                             <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black" />
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  )
}