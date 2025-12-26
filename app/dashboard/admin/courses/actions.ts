'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create Course
export async function createCourseAction(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const is_published = formData.get('is_published') === 'on'

  const { error } = await supabase
    .from('courses')
    .insert({ 
      title, 
      description, 
      is_published,
      category_id: category_id || null // Handle "Select Category" (empty string) case
    })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/manage-content')
}

// Update Course
export async function updateCourseAction(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const is_published = formData.get('is_published') === 'on'

  const { error } = await supabase
    .from('courses')
    .update({ 
      title, 
      description, 
      is_published,
      category_id: category_id || null
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

    revalidatePath('/dashboard/admin/manage-content')
}

// Delete Course
export async function deleteCourseAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('courses').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
    revalidatePath('/dashboard/admin/manage-content')
}