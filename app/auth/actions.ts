'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createDirectClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createDirectClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Helper to determine redirect path based on role
async function getRedirectPath(userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'super_admin') return '/dashboard/admin'
  if (profile?.role === 'school_admin') return '/dashboard'
  
  return '/categories'
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  const destination = await getRedirectPath(data.user.id)
  redirect(destination)
}

export async function signup(formData: FormData) {
  const supabase = await createClient() 
  const adminClient = getAdminClient() 

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string // <--- NEW: Get Address
  
  // Logic Changed: Prefer 'schoolId' (UUID) from the hidden input in SchoolSearchInput
  const schoolId = formData.get('schoolId') as string
  
  let organizationId = null
  if (schoolId && schoolId.trim() !== '') {
    organizationId = schoolId
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    await adminClient
      .from('profiles')
      .upsert({ 
        id: data.user.id,
        full_name: fullName,
        phone: phone,
        address: address, // <--- NEW: Save Address
        role: 'student',
        organization_id: organizationId,
      })
  }

  revalidatePath('/', 'layout')
  redirect('/categories')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}