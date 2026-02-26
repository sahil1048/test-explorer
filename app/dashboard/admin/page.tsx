import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Building2, 
  Users, 
  BookOpen, 
  Layers, 
  FileText,
  Plus, 
  ArrowUpRight,
  TrendingUp,
  Mail,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react'

export default async function SuperAdminDashboard() {
  const supabase = await createClient()

  const [
    schools, 
    students, 
    streams, 
    blogs, 
    mocktests, 
    messagesResponse, 
    activityResponse,
    recentTestsResponse
  ] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
    supabase.from('categories').select('id', { count: 'exact' }),
    supabase.from('blogs').select('id', { count: 'exact' }),
    supabase.from('mock_tests').select('id', { count: 'exact' }).is('subject_id', null),
    supabase
      .from('contact_messages')
      .select('*, organizations(name)')
      .eq('status', 'unread')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.rpc('get_monthly_exam_activity'),
    supabase
      .from('exam_results')
      .select('id, score, created_at, profiles(full_name), mock_tests(title)')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const kpis = [
    { label: 'Total Schools', value: schools.count || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/admin/schools' },
    { label: 'Total Students', value: students.count || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/dashboard/admin/users' },
    { label: 'Total Streams', value: streams.count || 0, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/admin/manage-content' },
    { label: 'Mock Tests', value: mocktests.count || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/dashboard/admin/mocktest' },
    { label: 'Published Blogs', value: blogs.count || 0, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', link: '/dashboard/admin/blogs' },
  ]

  const chartData = activityResponse.data || []
  const maxVal = chartData.length > 0 ? Math.max(...chartData.map((d: any) => Number(d.count))) : 100
  const contactMessages = messagesResponse.data || []
  const recentTests = recentTestsResponse.data || []

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Platform Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor your content, users, and incoming requests.</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/admin/schools/new" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm text-sm">
              <Plus className="w-4 h-4" /> School
            </Link>
            <Link href="/dashboard/admin/manage-content" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm text-sm">
              <Plus className="w-4 h-4" /> Stream
            </Link>
            <Link href="/dashboard/admin/blogs/create" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg text-sm">
              <Plus className="w-4 h-4" /> Write Blog
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {kpis.map((stat, i) => (
          <Link key={i} href={stat.link} className="group block bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-0.5">{stat.value.toLocaleString()}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Exam Activity</h3>
                    <p className="text-sm text-slate-500">Total mock tests submitted over time</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-bold">
                    <Activity className="w-4 h-4" /> Last 6 Months
                </div>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2 mt-auto">
                {chartData.map((data: any, i: number) => (
                    <div key={i} className="w-full bg-slate-100 rounded-t-md relative group h-full flex items-end">
                        <div 
                            style={{ height: `${(Number(data.count) / maxVal) * 100}%` }} 
                            className="w-full bg-slate-800 rounded-t-md transition-all duration-700 group-hover:bg-blue-600"
                        >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium py-2 px-3 rounded-md shadow-xl pointer-events-none transition-opacity z-20 whitespace-nowrap flex flex-col items-center">
                                <span className="font-bold">{data.count} Tests</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-3 text-xs font-medium text-slate-500 px-2">
                {chartData.map((d: any) => <span key={d.month}>{d.month}</span>)}
            </div>
        </div>

        <div className="space-y-8 lg:col-span-1">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-slate-900" />
                        <h3 className="text-lg font-bold text-slate-900">Inbox</h3>
                    </div>
                    {contactMessages.length > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {contactMessages.length} NEW
                        </span>
                    )}
                </div>

                <div className="space-y-3">
                    {contactMessages.length === 0 ? (
                        <div className="text-center py-6 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            You're all caught up!
                        </div>
                    ) : (
                        contactMessages.map((msg: any) => (
                            <Link key={msg.id} href={`/dashboard/admin/messages?id=${msg.id}`} className="block p-4 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-100 border border-transparent transition-colors group">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex flex-col">
                                      <h4 className="text-sm font-bold text-slate-900">{msg.name}</h4>
                                      {msg.organizations?.name && (
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                                          {msg.organizations.name}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1 mt-1">{msg.message}</p>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold">Live Activity</h3>
                </div>
                
                <div className="space-y-5">
                    {recentTests.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No recent tests taken.</p>
                    ) : (
                        recentTests.map((test: any, i: number) => (
                            <div key={i} className="flex gap-4 relative">
                                {i !== recentTests.length - 1 && (
                                    <div className="absolute top-6 left-2.5 w-0.5 h-10 bg-slate-700 -z-0"></div>
                                )}
                                <div className="mt-1 relative z-10">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-200">
                                        <span className="font-bold text-white">{test.profiles?.full_name || 'A student'}</span> completed{' '}
                                        <span className="text-blue-300">{test.mock_tests?.title || 'a test'}</span>
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-medium">
                                        <span className="text-emerald-400">Score: {test.score}%</span>
                                        <span className="flex items-center gap-1 font-bold text-slate-500 tracking-tighter">
                                          <Clock className="w-3 h-3" /> {new Date(test.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}