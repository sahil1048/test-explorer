'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Delete Single Mock Test
export async function deleteMockTest(id: string) {
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('mock_tests').delete().eq('id', id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/admin/mocktest')
  return { success: true }
}

// 2. Update Mock Test Details
export async function updateMockTest(id: string, formData: FormData) {
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
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

// 3. NEW: Bulk Delete Mock Tests (For "Delete All" button)
export async function deleteMockTestsAction(mockIds: string[]) {
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (!mockIds || mockIds.length === 0) {
    return { error: 'No tests selected for deletion.' }
  }

  // Delete all mocks where ID is in the array
  const { error } = await supabase
    .from('mock_tests')
    .delete()
    .in('id', mockIds)

  if (error) {
    console.error('Bulk delete error:', error)
    return { error: 'Failed to delete mock tests.' }
  }

  revalidatePath('/dashboard/admin/mocktest')
  return { success: true }
}