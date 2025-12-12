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


export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const schoolSlug = formData.get('schoolSlug') as string // Optional: for redirecting back

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  // If logged in from a school site, we keep them there but go to dashboard
  redirect('/courses') 
}

export async function signup(formData: FormData) {
  const supabase = await createClient() // Standard client for Auth
  const adminClient = getAdminClient()  // Admin client for DB Lookup/Writes

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  
  // Clean the slug
  const rawSlug = formData.get('schoolSlug') as string
  const schoolSlug = rawSlug ? rawSlug.trim().toLowerCase() : null
  
  console.log('Signup Attempt:', { email, schoolSlug }) // Debug Log

  let organizationId = null

  // 1. Resolve School Slug to ID using ADMIN CLIENT
  // This ensures we find the school even if RLS policies are strict
  if (schoolSlug) {
    const { data: org, error } = await adminClient
      .from('organizations')
      .select('id')
      .eq('slug', schoolSlug)
      .single()
    
    if (org) {
      organizationId = org.id
      console.log('Found Organization ID:', organizationId)
    } else {
      console.error('Organization Lookup Failed:', error)
    }
  }

  // 2. Sign up the user (Standard Client)
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

  // 3. Create/Update Profile (Using ADMIN CLIENT)
  // We use adminClient here to guarantee the write happens even if RLS is tricky
  if (data.user) {
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({ 
        id: data.user.id,
        full_name: fullName,
        phone: phone,
        role: 'student',
        organization_id: organizationId, // This will now be set correctly
      })

    if (profileError) {
      console.error('Profile creation failed:', profileError)
    }
  }

  revalidatePath('/', 'layout')
  
  // 4. Smart Redirect
  // If they signed up for a specific school, keep them on the Dashboard
  // The middleware will ensure they see the school's version
  redirect('/courses')
}
export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}