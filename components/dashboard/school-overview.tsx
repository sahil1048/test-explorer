import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarRange,
  GraduationCap,
  Megaphone,
  Plus,
  Presentation,
  School,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface SchoolAdminOverviewProps {
  profile: {
    full_name?: string | null
    organization_id?: string | null
    role?: string | null
  }
}

const adminQuickActions = [
  { label: 'Invite teacher', href: '/dashboard/people/teachers', icon: Presentation },
  { label: 'Add student', href: '/dashboard/people/students', icon: UserPlus },
  { label: 'Set up academics', href: '/dashboard/academics/academic-years', icon: GraduationCap },
  { label: 'New announcement', href: '/dashboard/communication/announcements', icon: Megaphone },
]

const teacherQuickActions = [
  { label: 'View students', href: '/dashboard/people/students', icon: Users },
  { label: 'Browse academics', href: '/dashboard/academics', icon: GraduationCap },
  { label: 'Assessments', href: '/dashboard/assessments', icon: BookOpen },
  { label: 'Announcements', href: '/dashboard/communication/announcements', icon: Megaphone },
]

export default async function SchoolAdminOverview({ profile }: SchoolAdminOverviewProps) {
  const supabase = await createClient()
  const organizationId = profile.organization_id
  const canManage = profile.role === 'school_admin'
  const quickActions = canManage ? adminQuickActions : teacherQuickActions

  if (!organizationId) {
    return (
      <EmptyPanel
        title="Your organization is not connected yet"
        description="Ask a platform administrator to connect this account to a school before continuing."
        href="/contact"
        action="Contact support"
      />
    )
  }

  const [
    organizationResult,
    currentYearResult,
    gradesResult,
    sectionsResult,
    subjectsResult,
    peopleResult,
    recentPeopleResult,
    announcementsResult,
    activityResult,
  ] = await Promise.all([
    supabase.from('organizations').select('id, name').eq('id', organizationId).maybeSingle(),
    supabase.from('academic_years').select('id, name, starts_on, ends_on').eq('organization_id', organizationId).eq('status', 'current').maybeSingle(),
    supabase.from('grades').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('is_active', true),
    supabase.from('sections').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('is_active', true),
    supabase.from('organization_subjects').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('is_active', true),
    supabase.from('profiles').select('id, role', { count: 'exact' }).eq('organization_id', organizationId).in('role', ['school_admin', 'teacher', 'student']),
    supabase.from('profiles').select('id, full_name, role, created_at').eq('organization_id', organizationId).in('role', ['school_admin', 'teacher', 'student']).order('created_at', { ascending: false }).limit(5),
    supabase.from('school_announcements').select('id, title, content, created_at').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(3),
    supabase.from('audit_events').select('id, summary, created_at, action').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(5),
  ])

  const organization = organizationResult.data
  const currentYear = currentYearResult.data
  const recentPeople = recentPeopleResult.data || []
  const announcements = announcementsResult.data || []
  const activity = activityResult.data || []
  const roleCounts = (peopleResult.data || []).reduce<Record<string, number>>((counts, person) => {
    counts[person.role] = (counts[person.role] || 0) + 1
    return counts
  }, {})

  const academicsConfigured = Boolean(currentYear && gradesResult.count && sectionsResult.count)

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" /> School workspace
            </span>
            {currentYear && <span className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 dark:border-white/10 dark:text-gray-400">{currentYear.name}</span>}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            Welcome back, {profile.full_name?.split(' ')[0] || (canManage ? 'Admin' : 'Teacher')}
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
            {academicsConfigured
              ? `Here is what is happening at ${organization?.name || 'your school'} today.`
              : 'Build your school structure first. Assessments and analytics will use this foundation.'}
          </p>
        </div>
        {!academicsConfigured && (
          <Link href="/dashboard/onboarding" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100">
            Continue setup <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        {academicsConfigured && canManage && (
          <Link href="/dashboard/intelligence" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100">
            Open intelligence center <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick actions</h2>
          <span className="text-xs text-gray-400">Set up and manage your school</span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-white/10 dark:bg-gray-900 dark:hover:border-white/20">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-600 transition group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-white/5 dark:text-gray-300 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-300">
                <action.icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-950 dark:text-white">Academic overview</h2>
                <p className="mt-1 text-xs text-gray-400">Real structure configured for the current school</p>
              </div>
              <Link href="/dashboard/academics/academic-years" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Manage</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <OverviewMetric icon={CalendarRange} label="Academic year" value={currentYear?.name || 'Not set'} />
              <OverviewMetric icon={GraduationCap} label="Grades" value={String(gradesResult.count || 0)} />
              <OverviewMetric icon={Users} label="Sections" value={String(sectionsResult.count || 0)} />
              <OverviewMetric icon={BookOpen} label="Subjects" value={String(subjectsResult.count || 0)} />
            </div>
            {!academicsConfigured && (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-950 dark:text-blue-200">Your academic structure is incomplete</p>
                  <p className="mt-1 text-xs text-blue-700/70 dark:text-blue-300/70">Add the current year, grades, sections, and subjects before inviting everyone.</p>
                </div>
                <Link href="/dashboard/onboarding" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300">Finish setup <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-gray-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-white/10">
              <div>
                <h2 className="font-semibold text-gray-950 dark:text-white">Recent users</h2>
                <p className="mt-1 text-xs text-gray-400">People who recently joined this workspace</p>
              </div>
              <Link href="/dashboard/people/students" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View people</Link>
            </div>
            {recentPeople.length ? (
              <div className="divide-y divide-gray-100 dark:divide-white/10">
                {recentPeople.map((person) => (
                  <div key={person.id} className="flex items-center gap-3 px-6 py-4">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gray-100 text-xs font-bold text-gray-600 dark:bg-white/5 dark:text-gray-300">{person.full_name?.slice(0, 2).toUpperCase() || 'U'}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{person.full_name || 'Unnamed user'}</p>
                      <p className="text-xs capitalize text-gray-400">{person.role.replaceAll('_', ' ')}</p>
                    </div>
                    <span className="hidden text-xs text-gray-400 sm:block">{new Date(person.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))}
              </div>
            ) : <InlineEmpty icon={Users} title="No users yet" description="Invite teachers and add students when your academic structure is ready." />}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-950 dark:text-white">People</h2>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              <PeopleRow label="School admins" value={roleCounts.school_admin || 0} />
              <PeopleRow label="Teachers" value={roleCounts.teacher || 0} />
              <PeopleRow label="Students" value={roleCounts.student || 0} />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-950 dark:text-white">Announcements</h2>
                <p className="mt-1 text-xs text-gray-400">Latest school updates</p>
              </div>
              <Link href="/dashboard/communication/announcements" className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 transition hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10"><Plus className="h-4 w-4" /></Link>
            </div>
            {announcements.length ? (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{announcement.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">{announcement.content}</p>
                  </div>
                ))}
              </div>
            ) : <InlineEmpty icon={Megaphone} title="No announcements" description="Share the first update with your school community." compact />}
          </section>

          <section className="rounded-3xl border border-dashed border-gray-300 bg-transparent p-6 dark:border-white/15">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-gray-400 shadow-sm dark:bg-white/5"><CalendarDays className="h-4.5 w-4.5" /></div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Upcoming events</p>
                <p className="mt-1 text-xs leading-5 text-gray-400">Calendar events will appear here in a later Phase 1 milestone.</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-950 dark:text-white">Today&apos;s activity</h2>
            {activity.length ? (
              <div className="mt-4 space-y-4">
                {activity.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <div><p className="text-xs font-medium text-gray-700 dark:text-gray-300">{event.summary}</p><p className="mt-1 text-[11px] text-gray-400">{new Date(event.created_at).toLocaleString('en-IN')}</p></div>
                  </div>
                ))}
              </div>
            ) : <p className="mt-3 text-xs leading-5 text-gray-400">No workspace activity has been recorded today.</p>}
          </section>
        </div>
      </div>
    </div>
  )
}

function OverviewMetric({ icon: Icon, label, value }: { icon: typeof School; label: string; value: string }) {
  return <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5"><Icon className="h-4 w-4 text-gray-400" /><p className="mt-4 truncate text-lg font-semibold text-gray-950 dark:text-white">{value}</p><p className="mt-1 text-xs text-gray-400">{label}</p></div>
}

function PeopleRow({ label, value }: { label: string; value: number }) {
  return <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-white/5"><span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span><span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</span></div>
}

function InlineEmpty({ icon: Icon, title, description, compact = false }: { icon: typeof Users; title: string; description: string; compact?: boolean }) {
  return <div className={`text-center ${compact ? 'py-5' : 'px-6 py-10'}`}><div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-400 dark:bg-white/5"><Icon className="h-4.5 w-4.5" /></div><p className="mt-3 text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-400">{description}</p></div>
}

function EmptyPanel({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-white/15 dark:bg-gray-900"><School className="mx-auto h-8 w-8 text-gray-300" /><h1 className="mt-4 text-xl font-semibold">{title}</h1><p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{description}</p><Link href={href} className="mt-6 inline-flex rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-gray-950">{action}</Link></div>
}
