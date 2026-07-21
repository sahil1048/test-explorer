'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import UserNav from '@/components/Navbar/UserNav'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import NotificationCenter from '@/components/dashboard/notification-center'
import ThemeToggle from '@/components/dashboard/theme-toggle'
import type { DashboardNavGroup } from '@/lib/dashboard/navigation'

interface DashboardShellProps {
  children: React.ReactNode
  groups: DashboardNavGroup[]
  schoolData: { name: string; logo_url?: string | null; school_code?: string | null } | null
  basePath: string
  profile: { full_name: string | null; role: string; organization_id: string | null; avatar_url?: string | null }
  email?: string
}

function formatSegment(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function DashboardShell({ children, groups, schoolData, basePath, profile, email }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const pageTitle = segments.length > 1 ? formatSegment(segments.at(-1) || 'Dashboard') : 'Dashboard'

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-gray-950 dark:bg-gray-950 dark:text-gray-100">
      <DashboardSidebar groups={groups} schoolData={schoolData} basePath={basePath} profile={profile} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="min-h-screen md:pl-[17rem]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200/70 bg-white/85 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/85 sm:px-6 lg:px-8">
          <button type="button" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 bg-white text-gray-600 md:hidden dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{pageTitle}</p>
            <p className="hidden text-xs text-gray-400 sm:block">{schoolData?.name || 'Test Explorer workspace'}</p>
          </div>
          <ThemeToggle />
          <NotificationCenter />
          <UserNav profile={profile} email={email} />
        </header>
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
