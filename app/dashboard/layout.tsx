import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getSchoolBySubdomain } from '@/lib/db/school'
import UserNav from '@/components/Navbar/UserNav' 
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

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

  if (!profile) return redirect('/complete-profile')

  // 3. School Detection
  const headersList = await headers()
  const schoolSlug = headersList.get("x-school-slug")
  
  let schoolData = null
  if (schoolSlug) {
    schoolData = await getSchoolBySubdomain(schoolSlug)
  }

  const basePath = schoolSlug ? `/${schoolSlug}` : ''

  // 4. Define Navigation (Using Strings for Icons)
  // ✅ FIX: Use string 'iconName' instead of passing the component
  const rawNavItems = [
    // --- Student Links ---
    { label: 'My Stats', href: '/dashboard', iconName: 'LayoutDashboard', roles: ['student'] },
    { label: 'My Courses', href: '/dashboard/my-courses', iconName: 'GraduationCap', roles: ['student'] },
    { label: 'My Exams', href: '/dashboard/exams', iconName: 'FileText', roles: ['student'] },

    // --- School Admin Links ---
    { label: 'Overview', href: '/dashboard', iconName: 'LayoutDashboard', roles: ['school_admin'] },
    { label: 'School Settings', href: '/dashboard/school-settings', iconName: 'Settings', roles: ['school_admin'] },
    { label: 'My Students', href: '/dashboard/students', iconName: 'Users', roles: ['school_admin'] },
    { label: 'Announcements', href: '/dashboard/announcements', iconName: 'Megaphone', roles: ['school_admin'] },
    { label: 'Leaderboard', href: '/dashboard/leaderboard', iconName: 'Trophy', roles: ['school_admin'] },

    // --- Super Admin Links ---
    { label: 'Overview', href: '/dashboard/admin', iconName: 'LayoutDashboard', roles: ['super_admin'] },
    { label: 'Schools', href: '/dashboard/admin/schools', iconName: 'Building2', roles: ['super_admin'] },
    { label: 'Mock Blueprints', href: '/dashboard/admin/blueprints', iconName: 'Map', roles: ['super_admin'] },
    { label: 'Mock Tests', href: '/dashboard/admin/mocktest', iconName: 'Pen', roles: ['super_admin'] },
    { label: 'Manage Content', href: '/dashboard/admin/manage-content', iconName: 'BookOpen', roles: ['super_admin'] },
    { label: 'Courses', href: '/dashboard/admin/exams', iconName: 'FileText', roles: ['super_admin'] },
    { label: 'Question Pool', href: '/dashboard/admin/question-uploads', iconName: 'Database', roles: ['super_admin'] },
    { label: 'Users', href: '/dashboard/admin/users', iconName: 'Users', roles: ['super_admin'] },
    { label: 'Tags', href: '/dashboard/admin/tags', iconName: 'TagIcon', roles: ['super_admin'] },
    { label: 'Blogs', href: '/dashboard/admin/blogs', iconName: 'Newspaper', roles: ['super_admin'] },
    { label: 'Leaderboard', href: '/dashboard/admin/leaderboard', iconName: 'Trophy', roles: ['super_admin'] },
    { label: 'Rank Config', href: '/dashboard/admin/rank-prediction', iconName: 'BarChart3', roles: ['super_admin'] },
    { label: 'Exam Landing Pages', href: '/dashboard/admin/exam-landing-pages', iconName: 'Globe', roles: ['super_admin'] },

  ]

  const visibleItems = rawNavItems
    .filter(item => item.roles.includes(profile.role))
    .map(item => ({
      ...item,
      href: `${basePath}${item.href}`
    }))

  return (
    <div className="min-h-screen flex bg-gray-50">
      
      <DashboardSidebar 
        visibleItems={visibleItems}
        schoolData={schoolData}
        basePath={basePath}
        profile={profile}
      />

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