import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  Users, 
  ShieldAlert, 
  FileText,
  Building2,
  Library,
  Layers
} from 'lucide-react'
import UserNav from '@/components/Navbar/UserNav' // Reusing your existing component

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Verify Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Fetch Profile & Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return redirect('/')

  // 3. Define Navigation based on Role
  const navItems = [
    // --- Student Links ---
    {
      label: 'My Stats',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['student']
    },
    {
      label: 'Browse Courses', 
      href: '/categories', // <--- CHANGED FROM /courses TO /categories
      icon: BookOpen,
      roles: ['student']
    },
    {
      label: 'My Exams',
      href: '/dashboard/exams',
      icon: FileText,
      roles: ['student']
    },

    // --- School Admin Links ---
    {
      label: 'Overview',
      href: '/dashboard', 
      icon: LayoutDashboard,
      roles: ['school_admin']
    },
    {
      label: 'School Settings',
      href: '/dashboard/school-settings',
      icon: Settings,
      roles: ['school_admin']
    },
    {
      label: 'My Students',
      href: '/dashboard/students',
      icon: Users,
      roles: ['school_admin']
    },

    // --- Super Admin Links ---
    {
      label: 'Overview',
      href: '/dashboard/admin',
      icon: LayoutDashboard,
      roles: ['super_admin']
    },
    {
      label: 'Schools',
      href: '/dashboard/admin/schools',
      icon: Building2, 
      roles: ['super_admin']
    },
    {
      label: 'Streams', // <--- NEW LINK
      href: '/dashboard/admin/streams',
      icon: Layers, 
      roles: ['super_admin']
    },
    {
      label: 'Courses',
      href: '/dashboard/admin/courses',
      icon: BookOpen,
      roles: ['super_admin']
    },
    {
      label: 'Subjects',
      href: '/dashboard/admin/subjects',
      icon: Library,
      roles: ['super_admin']
    },
    {
      label: 'Exams',
      href: '/dashboard/admin/exams',
      icon: FileText,
      roles: ['super_admin']
    },
    {
      label: 'Users',
      href: '/dashboard/admin/users',
      icon: Users,
      roles: ['super_admin']
    },
  ]

  // Filter items visible to this user
  const visibleItems = navItems.filter(item => item.roles.includes(profile.role))

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/" className="text-xl font-black tracking-tighter text-blue-600">Test Explorer</Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              {profile.role === 'super_admin' ? 'SA' : profile.role === 'school_admin' ? 'AD' : 'ST'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{profile.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
          <h1 className="font-semibold text-gray-800">Dashboard</h1>
          <UserNav profile={profile} email={user.email} />
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}