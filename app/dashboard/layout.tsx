import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getSchoolBySubdomain } from '@/lib/db/school'
import DashboardShell from '@/components/dashboard/dashboard-shell'
import { getDashboardNavigation } from '@/lib/dashboard/navigation'
import { isAppRole } from '@/lib/auth/roles'

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

  const role = isAppRole(profile.role) ? profile.role : 'student'
  const navigation = getDashboardNavigation(role, basePath)

  return (
    <DashboardShell
      groups={navigation}
      schoolData={schoolData}
      basePath={basePath}
      profile={profile}
      email={user.email}
    >
      {children}
    </DashboardShell>
  )
}
