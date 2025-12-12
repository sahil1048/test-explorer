'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- DELETE SCHOOL ---
export async function deleteSchoolAction(formData: FormData) {
  const supabase = await createClient()
  const schoolId = formData.get('schoolId') as string

  // 1. Delete the organization
  // Note: Ensure your database Foreign Keys are set to "ON DELETE CASCADE" 
  // if you want profiles/data to be removed automatically. 
  // Otherwise, this might fail if data is linked.
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', schoolId)

  if (error) {
    console.error('Delete failed:', error)
    throw new Error('Failed to delete school.')
  }

  revalidatePath('/dashboard/admin/schools')
}

// --- UPDATE SCHOOL ---
export async function updateSchoolAction(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const welcome_message = formData.get('welcome_message') as string

  const { error } = await supabase
    .from('organizations')
    .update({ 
      name, 
      slug: slug.toLowerCase(), 
      welcome_message 
    })
    .eq('id', id)

  if (error) {
    console.error('Update failed:', error)
    throw new Error('Failed to update school.')
  }

  revalidatePath('/dashboard/admin/schools')
  redirect('/dashboard/admin/schools')
}