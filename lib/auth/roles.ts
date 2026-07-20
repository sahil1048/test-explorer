export const APP_ROLES = ['super_admin', 'school_admin', 'teacher', 'student'] as const

export type AppRole = (typeof APP_ROLES)[number]

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  school_admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
}

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole)
}
