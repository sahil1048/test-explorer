import 'server-only'

import { redirect } from 'next/navigation'
import type { AppRole } from '@/lib/auth/roles'
import { AuthorizationError, requireRole } from '@/lib/auth/require-role'

export async function requireDashboardRole(allowedRoles: readonly AppRole[]) {
  try {
    return await requireRole(allowedRoles)
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect(error.code === 'AUTHENTICATION_REQUIRED' ? '/login' : '/dashboard')
    }
    throw error
  }
}
