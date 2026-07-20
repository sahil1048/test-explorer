export type NotificationTone = 'info' | 'success' | 'warning'

export interface DashboardNotification {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
  tone: NotificationTone
  actionUrl?: string
}

export const DUMMY_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: 'welcome',
    title: 'Your school workspace is ready',
    body: 'Start by configuring the current academic year and school structure.',
    createdAt: 'Just now',
    read: false,
    tone: 'info',
    actionUrl: '/dashboard/onboarding',
  },
  {
    id: 'foundation',
    title: 'Assessment tools are coming next',
    body: 'Phase 1 focuses on your organization, academics, and people.',
    createdAt: 'Today',
    read: true,
    tone: 'success',
  },
]
