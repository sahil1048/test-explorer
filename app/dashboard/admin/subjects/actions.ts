'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create Subject
export async function createSubjectAction(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  const { error } = await supabase
    .from('subjects')
    .insert({ title, course_id })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/manage-content')
}

// Update Subject
export async function updateSubjectAction(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  const { error } = await supabase
    .from('subjects')
    .update({ title, course_id })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/manage-content')
}

// Delete Subject
export async function deleteSubjectAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('subjects').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/manage-content')
}

