'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update your profile.' }
  }

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  
  // Update Profile
  const { error } = await supabase
    .from('profiles')
    .update({ 
      full_name: fullName,
      phone: phone,
      address: address,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile Update Error:', error.message) // Check your terminal for this!
    return { error: `Update failed: ${error.message}` }
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}