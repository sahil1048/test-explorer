import type { AppRole } from '@/lib/auth/roles'

export const PERMISSIONS = [
  'platform.manage',
  'organization.view',
  'organization.manage',
  'academics.view',
  'academics.manage',
  'people.view',
  'people.manage',
  'announcements.view',
  'announcements.manage',
  'assessments.view',
  'assessments.manage',
  'analytics.view',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  super_admin: PERMISSIONS,
  school_admin: [
    'organization.view',
    'organization.manage',
    'academics.view',
    'academics.manage',
    'people.view',
    'people.manage',
    'announcements.view',
    'announcements.manage',
    'assessments.view',
    'assessments.manage',
    'analytics.view',
  ],
  teacher: [
    'organization.view',
    'academics.view',
    'people.view',
    'announcements.view',
    'assessments.view',
    'assessments.manage',
    'analytics.view',
  ],
  student: ['organization.view', 'announcements.view', 'assessments.view'],
}

export function hasPermission(role: AppRole, permission: Permission) {
  return ROLE_PERMISSIONS[role].includes(permission)
}
