'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'

export async function createTagAction(formData: FormData) {
  await requireSuperAdmin()
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name) return { error: 'Name is required' }

  const { error } = await supabase.from('tags').insert({ name })

  if (error) {
    console.error('Error creating tag:', error)
    return { error: 'Tag already exists or failed to create' }
  }

  revalidatePath('/dashboard/admin/tags')
  revalidatePath('/dashboard/admin/blogs/create')
  return { success: true }
}

export async function deleteTagAction(formData: FormData) {
  await requireSuperAdmin()
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) {
    console.error('Error deleting tag:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin/tags')
  revalidatePath('/dashboard/admin/blogs/create')
  return { success: true }
}
