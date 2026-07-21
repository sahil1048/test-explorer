import type { AppRole } from '@/lib/auth/roles'

export interface DashboardNavItem {
  label: string
  href: string
  iconName: string
  badge?: string
  disabled?: boolean
}

export interface DashboardNavGroup {
  label?: string
  items: DashboardNavItem[]
}

const schoolWorkspace: DashboardNavGroup[] = [
  {
    items: [{ label: 'Dashboard', href: '/dashboard', iconName: 'LayoutDashboard' }],
  },
  {
    label: 'Academics',
    items: [
      { label: 'Academic Years', href: '/dashboard/academics/academic-years', iconName: 'CalendarRange' },
      { label: 'Grades', href: '/dashboard/academics/grades', iconName: 'Layers3' },
      { label: 'Sections', href: '/dashboard/academics/sections', iconName: 'PanelsTopLeft' },
      { label: 'Subjects', href: '/dashboard/academics/subjects', iconName: 'BookOpen' },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Teachers', href: '/dashboard/people/teachers', iconName: 'Presentation' },
      { label: 'Students', href: '/dashboard/people/students', iconName: 'Users' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Question Bank', href: '/dashboard/question-bank', iconName: 'Database' },
      { label: 'Assessments', href: '/dashboard/assessments', iconName: 'ClipboardCheck' },
      { label: 'Evaluation', href: '/dashboard/evaluation', iconName: 'ChartNoAxesCombined' },
      { label: 'Intelligence', href: '/dashboard/intelligence', iconName: 'ChartNoAxesCombined' },
      { label: 'Announcements', href: '/dashboard/communication/announcements', iconName: 'Megaphone' },
    ],
  },
  {
    label: 'Organization',
    items: [{ label: 'Settings', href: '/dashboard/settings', iconName: 'Settings' }],
  },
]

const studentWorkspace: DashboardNavGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', iconName: 'LayoutDashboard' },
      { label: 'My Courses', href: '/dashboard/my-courses', iconName: 'GraduationCap' },
      { label: 'Assigned Assessments', href: '/dashboard/assigned-assessments', iconName: 'FileText' },
    ],
  },
]

const platformWorkspace: DashboardNavGroup[] = [
  {
    items: [{ label: 'Platform Overview', href: '/dashboard/admin', iconName: 'LayoutDashboard' }],
  },
  {
    label: 'Organizations',
    items: [
      { label: 'Schools', href: '/dashboard/admin/schools', iconName: 'Building2' },
      { label: 'Users', href: '/dashboard/admin/users', iconName: 'Users' },
      { label: 'Messages', href: '/dashboard/admin/messages', iconName: 'Mail' },
    ],
  },
  {
    label: 'Legacy content',
    items: [
      { label: 'Manage Content', href: '/dashboard/admin/manage-content', iconName: 'BookOpen' },
      { label: 'Courses', href: '/dashboard/admin/exams', iconName: 'FileText' },
      { label: 'Question Pool', href: '/dashboard/admin/question-uploads', iconName: 'Database' },
      { label: 'Mock Blueprints', href: '/dashboard/admin/blueprints', iconName: 'Map' },
      { label: 'Mock Tests', href: '/dashboard/admin/mocktest', iconName: 'Pen' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { label: 'Blogs', href: '/dashboard/admin/blogs', iconName: 'Newspaper' },
      { label: 'Tags', href: '/dashboard/admin/tags', iconName: 'Tag' },
      { label: 'Exam Pages', href: '/dashboard/admin/exam-landing-pages', iconName: 'Globe' },
      { label: 'Rank Config', href: '/dashboard/admin/rank-prediction', iconName: 'ChartNoAxesCombined' },
      { label: 'Leaderboard', href: '/dashboard/admin/leaderboard', iconName: 'Trophy' },
    ],
  },
]

function withBasePath(groups: DashboardNavGroup[], basePath: string) {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, href: `${basePath}${item.href}` })),
  }))
}

export function getDashboardNavigation(role: AppRole, basePath = ''): DashboardNavGroup[] {
  const groups = role === 'super_admin'
    ? platformWorkspace
    : role === 'student'
      ? studentWorkspace
      : schoolWorkspace

  return withBasePath(groups, basePath)
}
