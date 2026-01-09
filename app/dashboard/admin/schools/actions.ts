'use server'

import { createClient } from '@supabase/supabase-js' 
import { revalidatePath } from 'next/cache'

export async function deleteSchoolAction(formData: FormData) {
  const schoolId = formData.get('schoolId') as string

  if (!schoolId) return { error: 'School ID is required for deletion.' }

  // 1. Initialize Admin Client (Required for deleting Auth users)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // 2. Fetch all users linked to this school
    // We need their IDs to delete them from the Auth system
    const { data: schoolUsers, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('organization_id', schoolId)

    if (fetchError) {
      return { error: 'Failed to prepare school deletion.' }
    }

    // 3. Delete users from Supabase Auth
    // This will likely cascade delete their profile rows if your DB is set up correctly,
    // but we do this primarily to remove them from the "Users" tab.
    if (schoolUsers && schoolUsers.length > 0) {
      const deletePromises = schoolUsers.map((user) => 
        supabaseAdmin.auth.admin.deleteUser(user.id)
      )
      
      // Run all deletions in parallel
      await Promise.all(deletePromises)
    }

    // 4. Delete the Organization
    const { error: deleteOrgError } = await supabaseAdmin
      .from('organizations')
      .delete()
      .eq('id', schoolId)

    if (deleteOrgError) {
      return { error: 'Failed to delete school organization.' }
    }

  } catch (error) {
    console.error('Full Delete Error:', error)
    return { error: 'Failed to complete school deletion.' }
  }

  revalidatePath('/dashboard/admin/schools')
  return { success: true }
}

// --- UPDATE SCHOOL ---
export async function updateSchoolAction(formData: FormData) {
  // 1. Initialize Admin Client (Bypasses RLS for smooth updates)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const id = formData.get('id') as string

  // Extract and sanitize fields
  const name = (formData.get('name') as string || '').trim()
  const slug = (formData.get('slug') as string || '').toLowerCase().trim().replace(/\s+/g, '-')
  const welcome_message = (formData.get('welcome_message') as string || '').trim()

  if (!id || !name || !slug) return { error: 'Missing required fields.' }

  const { error } = await supabaseAdmin
    .from('organizations')
    .update({ 
      name,
      slug,
      welcome_message 
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'This slug is already taken.' }
    }
    return { error: `Failed to update school: ${error.message}` }
  }

  revalidatePath('/dashboard/admin/schools')
  return { success: true }
}

export async function createSchoolAction(formData: FormData) {
    'use server'
    
    // 1. Initialize Admin Client (Bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, 
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 2. Extract Form Data
    const name = (formData.get('name') as string || '').trim()
    const slug = (formData.get('slug') as string || '').toLowerCase().trim().replace(/\s+/g, '-')
    const adminName = (formData.get('adminName') as string || '').trim()
    const email = (formData.get('email') as string || '').trim()
    const password = (formData.get('password') as string || '').trim()

    if (!name || !slug || !adminName || !email || !password) {
      return { error: 'All fields are required.' }
    }

    // 3. Create the Organization (School)
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({ name, slug, welcome_message: `Welcome to ${name}` })
      .select()
      .single()

    if (orgError) {
      return { error: 'Failed to create school. Slug might be taken.' }
    }

    // 4. Create the School Admin User (Auth)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: adminName }
    })

    if (authError) {
      // Cleanup orphan org
      await supabaseAdmin.from('organizations').delete().eq('id', org.id)
      return { error: 'Failed to create admin user. Email might be taken.' }
    }

    // 5. Create Profile & Link to Org
    if (authUser.user && org) {
       const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ // <--- CHANGED FROM insert TO upsert
          id: authUser.user.id,
          full_name: adminName,
          role: 'school_admin', // This will now overwrite 'student'
          organization_id: org.id
        })
      
      if (profileError) {
        console.error('Profile Error:', profileError)
        return { error: 'School created but profile failed. Please contact support.' }
      }
    }

    revalidatePath('/dashboard/admin/schools')
    return { success: true }
  }