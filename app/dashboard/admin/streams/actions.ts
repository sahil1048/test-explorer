'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create Stream
export async function createStreamAction(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const icon_key = formData.get('icon_key') as string
  const bg_color = formData.get('bg_color') as string
  const order_index = parseInt(formData.get('order_index') as string) || 0

  const { error } = await supabase
    .from('categories')
    .insert({ title, description, icon_key, bg_color, order_index })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/manage-content')
}

// Update Stream
export async function updateStreamAction(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const icon_key = formData.get('icon_key') as string
  const bg_color = formData.get('bg_color') as string
  const order_index = parseInt(formData.get('order_index') as string) || 0

  const { error } = await supabase
    .from('categories')
    .update({ title, description, icon_key, bg_color, order_index })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/manage-content')
}

// Delete Stream
export async function deleteStreamAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('categories').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/admin/manage-content')
}