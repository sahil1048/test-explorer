'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
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

async function getRedirectPath(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const headersList = await headers()
  const referer = headersList.get('referer') 
  
  let schoolPrefix = ''
  
  if (referer) {
    try {
      const url = new URL(referer)
      const parts = url.pathname.split('/')
      const candidate = parts[1]

      const SYSTEM_ROUTES = [
        'login', 'signup', 'dashboard', 'api', 'about', 'contact', 
        'streams', 'categories', 'blogs', 'forgot-password', 
        'update-password', 'auth', 'profile'
      ]

      if (candidate && !SYSTEM_ROUTES.includes(candidate)) {
        schoolPrefix = `/${candidate}`
      }
    } catch (e) {
    }
  }

  if (profile?.role === 'super_admin') {
    return '/dashboard/admin'
  }
  
  if (profile?.role === 'school_admin') {
    return `${schoolPrefix}/dashboard`
  }
  
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
  
  const destination = await getRedirectPath(data.user.id)
  
  return { success: true, redirectUrl: destination }
}

export async function signup(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  console.log("SERVER ACTION: Signup received data:", rawData)
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables.")
    return { error: "Server configuration error. Please contact support." }
  }

  const supabase = await createClient() 
  const adminClient = getAdminClient() 

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const stream = formData.get('stream') as string
  const state = formData.get('state') as string
  const city = formData.get('city') as string
  
  const schoolId = formData.get('schoolId') as string
  
  let organizationId = null
  if (schoolId && schoolId.trim() !== '' && schoolId !== 'undefined' && schoolId !== 'null') {
    organizationId = schoolId
  }

  let userId: string | null = null;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          organization_id: organizationId,
          stream: stream,
          state: state,
          city: city,
          role: 'student',
        },
      },
    })

    if (error) {
      console.error("Supabase Auth Error:", error.message)
      return { error: error.message }
    }

    if (data.user) {
      userId = data.user.id
      
      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({ 
          id: data.user.id,
          full_name: fullName,
          phone: phone,
          role: 'student',
          organization_id: organizationId,
          stream: stream,
          state: state,
          city: city,
        })
      
      if (profileError) {
        console.error("CRITICAL: Profile creation failed:", profileError)
        return { error: "Profile creation failed: " + profileError.message }
      } else {
        console.log("SUCCESS: Profile created for user", data.user.id)
      }
    }
  } catch (err) {
    console.error("UNEXPECTED ERROR in signup action:", err)
    return { error: "An unexpected error occurred during signup." }
  }

  revalidatePath('/', 'layout')
  
  if (userId) {
    const destination = await getRedirectPath(userId)
    return { success: true, redirectUrl: destination }
  } else {
    return { error: "Signup failed to retrieve user ID." }
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
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