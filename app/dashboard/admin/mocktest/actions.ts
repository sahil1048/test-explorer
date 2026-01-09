'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteMockTest(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('mock_tests').delete().eq('id', id)
  
  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/mocktest')
  return { success: true }
}

export async function updateMockTest(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const duration = parseInt(formData.get('duration') as string)

  const { error } = await supabase.from('mock_tests').update({
    title,
    duration_minutes: duration
  }).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/mocktest')
  return { success: true }
}