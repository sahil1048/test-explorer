'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarRange,
  ChartNoAxesCombined,
  ClipboardCheck,
  Database,
  FileText,
  Globe,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  Mail,
  Map,
  Megaphone,
  Newspaper,
  PanelsTopLeft,
  Pen,
  Presentation,
  Settings,
  Tag,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import type { DashboardNavGroup } from '@/lib/dashboard/navigation'

const ICONS: Record<string, LucideIcon> = {
  BarChart3,
  BookOpen,
  Building2,
  CalendarRange,
  ChartNoAxesCombined,
  ClipboardCheck,
  Database,
  FileText,
  Globe,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  Mail,
  Map,
  Megaphone,
  Newspaper,
  PanelsTopLeft,
  Pen,
  Presentation,
  Settings,
  Tag,
  Trophy,
  Users,
}

interface SchoolSummary {
  name: string
  logo_url?: string | null
  school_code?: string | null
}

interface ProfileSummary {
  full_name?: string | null
  role: string
  avatar_url?: string | null
}

interface SidebarProps {
  groups: DashboardNavGroup[]
  schoolData: SchoolSummary | null
  basePath: string
  profile: ProfileSummary
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function isRouteActive(pathname: string, href: string) {
  if (href.endsWith('/dashboard')) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardSidebar({
  groups,
  schoolData,
  basePath,
  profile,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-gray-950/40 backdrop-blur-sm md:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-xl transition-transform duration-200 dark:border-white/10 dark:bg-gray-950/95 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5 dark:border-white/10">
          <Link href={schoolData ? `${basePath}/` : '/'} className="flex min-w-0 flex-1 items-center gap-3" onClick={onMobileClose}>
            {schoolData?.logo_url ? (
              <Image src={schoolData.logo_url} alt="" width={36} height={36} unoptimized className="h-9 w-9 shrink-0 rounded-xl border border-gray-100 object-contain" />
            ) : (
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gray-950 text-xs font-bold text-white shadow-sm dark:bg-white dark:text-gray-950">
                {schoolData?.name ? schoolData.name.slice(0, 2).toUpperCase() : 'TE'}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-950 dark:text-white">{schoolData?.name || 'Test Explorer'}</p>
              <p className="truncate text-[11px] font-medium text-gray-400">{schoolData?.school_code || 'Assessment Intelligence'}</p>
            </div>
          </Link>
          <button type="button" aria-label="Close navigation" onClick={onMobileClose} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 md:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {groups.map((group, groupIndex) => (
            <div key={group.label || `primary-${groupIndex}`}>
              {group.label && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">{group.label}</p>}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isRouteActive(pathname, item.href)
                  const Icon = ICONS[item.iconName] || LayoutDashboard
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all ${active ? 'bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white'}`}
                    >
                      <Icon className={`h-[18px] w-[18px] ${active ? '' : 'text-gray-400 transition group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${active ? 'bg-white/15 text-white dark:bg-gray-950/10 dark:text-gray-800' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300'}`}>{item.badge}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-3 dark:border-white/10">
          <Link href="/profile" onClick={onMobileClose} className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-gray-50 dark:hover:bg-white/5">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="" width={36} height={36} unoptimized className="h-9 w-9 rounded-xl object-cover" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                {profile.full_name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{profile.full_name || 'User'}</p>
              <p className="truncate text-xs capitalize text-gray-400">{profile.role.replaceAll('_', ' ')}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}
