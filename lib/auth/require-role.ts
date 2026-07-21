import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { AppRole } from '@/lib/auth/roles'

export class AuthorizationError extends Error {
  constructor(message = 'You are not authorized to perform this action.') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export async function requireRole(allowedRoles: readonly AppRole[]) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new AuthorizationError('Authentication required.')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !allowedRoles.includes(profile.role as AppRole)) {
    throw new AuthorizationError()
  }

  return { supabase, user, profile }
}

export function requireSuperAdmin() {
  return requireRole(['super_admin'])
}
