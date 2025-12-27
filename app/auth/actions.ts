'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createDirectClient } from '@supabase/supabase-js'

// Admin client for bypassing RLS during profile creation
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

// --- NEW: Helper to determine redirect path based on Role AND Context (School vs Main) ---
async function getRedirectPath(userId: string) {
  const supabase = await createClient()
  
  // 1. Fetch User Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  // 2. Detect School Context from Referer
  // This tells us if the user logged in from "testexplorer.in/ops/login" or just "/login"
  const headersList = await headers()
  const referer = headersList.get('referer') 
  
  let schoolPrefix = ''
  
  if (referer) {
    try {
      const url = new URL(referer)
      // Path parts: ["", "ops", "login"] or ["", "login"]
      const parts = url.pathname.split('/')
      const candidate = parts[1] // The first segment

      // List of system routes that are NOT school slugs
      const SYSTEM_ROUTES = [
        'login', 'signup', 'dashboard', 'api', 'about', 'contact', 
        'streams', 'categories', 'blogs', 'forgot-password', 
        'update-password', 'auth', 'profile'
      ]

      // If the first segment is NOT a system route, treat it as a school slug
      if (candidate && !SYSTEM_ROUTES.includes(candidate)) {
        schoolPrefix = `/${candidate}`
      }
    } catch (e) {
      // If URL parsing fails, ignore and assume main site
    }
  }

  // 3. Determine Destination
  if (profile?.role === 'super_admin') {
    return '/dashboard/admin' // Super Admin always goes to global admin
  }
  
  if (profile?.role === 'school_admin') {
    // School Admin goes to School Dashboard (e.g., "/ops/dashboard" or "/dashboard")
    return `${schoolPrefix}/dashboard`
  }
  
  // Students go to Categories/Streams (e.g., "/ops/categories" or "/categories")
  return `${schoolPrefix}/categories`
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
  
  // Use the new context-aware redirect
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
  const address = formData.get('address') as string
  const stream = formData.get('stream') as string
  
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
        organization_id: schoolId,
        stream: stream,
        role: 'student',
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // --- UPDATED: Robust Profile Creation with Error Logging ---
  if (data.user) {
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({ 
        id: data.user.id,
        full_name: fullName,
        phone: phone,
        address: address,
        role: 'student',
        organization_id: organizationId,
        stream: stream,
      })
    
    if (profileError) {
      console.error("CRITICAL: Profile creation failed:", profileError)
      // Optional: Return error to UI so user knows something went wrong
      // return { error: "Account created but profile setup failed. Please contact support." }
    }
  }

  revalidatePath('/', 'layout')
  
  // Use the new context-aware redirect
  const destination = await getRedirectPath(data.user!.id)
  redirect(destination)
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