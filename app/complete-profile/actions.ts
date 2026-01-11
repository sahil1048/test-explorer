'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeProfileAction(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const stream = formData.get('stream') as string
  const state = formData.get('state') as string
  const city = formData.get('city') as string

  if (!fullName || !phone || !stream || !state || !city) {
    return { error: 'Please fill in all required fields to continue.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone, // Ensure this matches your DB column (phone vs phone_no)
      stream: stream,
      state: state,
      city: city,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    console.error("Profile Update Error:", error)
    return { error: error.message }
  }

  // Revalidate relevant paths
  revalidatePath('/dashboard')
  revalidatePath('/categories')
  
  return { success: true }
}