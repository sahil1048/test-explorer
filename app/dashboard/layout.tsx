import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import { getSchoolBySubdomain } from '@/lib/db/school'
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  Users, 
  FileText,
  Building2,
  Library,
  Layers,
  Megaphone,
  GraduationCap,
  Newspaper,
  Trophy
} from 'lucide-react'
import UserNav from '@/components/Navbar/UserNav' 

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

  // 3. --- UPDATED: Robust Domain Detection (Flicker Fix) ---
  const headersList = await headers()
  
  // Read custom header from middleware FIRST
  const domain = headersList.get("x-current-domain") || 
                 headersList.get("x-forwarded-host") || 
                 headersList.get("host") || ""

  let schoolData = null
  let subdomain = null
  
  // Handle localhost vs production
  if (domain.includes("localhost")) {
    const parts = domain.split(".")
    if (parts.length >= 2) {
      subdomain = parts[0]
    }
  } else {
    // Production (e.g., school.testexplorer.com)
    const parts = domain.split(".")
    if (parts.length >= 3) {
      subdomain = parts[0]
    }
  }

  // Fetch School Data if Subdomain exists
  if (subdomain && subdomain !== "www" && subdomain !== "test-explorer") {
    schoolData = await getSchoolBySubdomain(subdomain)
  }

  // 4. Define Navigation
  const navItems = [
    // --- Student Links ---
    {
      label: 'My Stats',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['student']
    },
    {
      label: 'My Courses',
      href: '/dashboard/my-courses',
      icon: GraduationCap,
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
    { 
      label: 'Announcements', 
      href: '/dashboard/announcements', 
      icon: Megaphone, 
      roles: ['school_admin'] 
    },
    {
      label: 'Leaderboard', // <--- NEW
      href: '/dashboard/leaderboard',
      icon: Trophy,
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
      label: 'Streams', 
      href: '/dashboard/admin/streams',
      icon: Layers, 
      roles: ['super_admin']
    },
    {
      label: 'Exams',
      href: '/dashboard/admin/courses',
      icon: BookOpen,
      roles: ['super_admin']
    },
    {
      label: 'Courses',
      href: '/dashboard/admin/exams',
      icon: FileText,
      roles: ['super_admin']
    },
    {
      label: 'Subjects',
      href: '/dashboard/admin/subjects',
      icon: Library,
      roles: ['super_admin']
    },
    {
      label: 'Users',
      href: '/dashboard/admin/users',
      icon: Users,
      roles: ['super_admin']
    },
    {
      label: 'Blogs',
      href: '/dashboard/admin/blogs',
      icon: Newspaper,
      roles: ['super_admin']
    },
    {
      label: 'Leaderboard', // <--- NEW
      href: '/dashboard/admin/leaderboard',
      icon: Trophy,
      roles: ['super_admin']
    },
  ]

  const visibleItems = navItems.filter(item => item.roles.includes(profile.role))

  return (
    <div className="min-h-screen flex bg-gray-50">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed inset-y-0 left-0 z-50">
        
        {/* BRANDING - Uses the robust schoolData */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          {schoolData ? (
            <Link href="/" className="flex items-center gap-3 group">
              {schoolData.logo_url ? (
                <div className="w-8 h-8 relative shrink-0">
                  <img 
                    src={schoolData.logo_url} 
                    alt={schoolData.name} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                  {schoolData.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {schoolData.name}
              </span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                TE
              </div>
              <span className="text-xl font-black tracking-tighter text-blue-600">
                Test Explorer
              </span>
            </Link>
          )}
        </div>
        
        {/* NAV LINKS */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* USER FOOTER */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
              profile.role === 'super_admin' ? 'bg-purple-600' : 
              profile.role === 'school_admin' ? 'bg-black' : 'bg-blue-600'
            }`}>
              {profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{profile.full_name}</p>
              <p className="text-xs text-gray-500 capitalize truncate">
                {profile.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
          <h1 className="font-bold text-lg text-gray-800">Dashboard</h1>
          <UserNav profile={profile} email={user.email} />
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}