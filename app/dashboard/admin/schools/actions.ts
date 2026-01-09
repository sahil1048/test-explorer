'use server'

import { createClient } from '@supabase/supabase-js' 
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteSchoolAction(formData: FormData) {
  const schoolId = formData.get('schoolId') as string

  if (!schoolId) throw new Error('School ID is required for deletion.')

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
      console.error('Error fetching school users:', fetchError)
      throw new Error('Failed to prepare school deletion.')
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
      console.error('Delete org failed:', deleteOrgError)
      throw new Error('Failed to delete school organization.')
    }

  } catch (error) {
    console.error('Full Delete Error:', error)
    throw new Error('Failed to complete school deletion.')
  }

  revalidatePath('/dashboard/admin/schools')
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

  if (!id || !name || !slug) throw new Error('Missing required fields.')

  const { error } = await supabaseAdmin
    .from('organizations')
    .update({ 
      name,
      slug,
      welcome_message 
    })
    .eq('id', id)

  if (error) {
    console.error('Update failed:', error)
    if (error.code === '23505') {
      throw new Error('This slug is already taken.')
    }
    throw new Error('Failed to update school.')
  }

  revalidatePath('/dashboard/admin/schools')
  redirect('/dashboard/admin/schools')
}