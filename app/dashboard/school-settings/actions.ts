'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateSchoolSettingsAction(formData: FormData) {
  const supabase = await createClient()
  
  const organizationId = formData.get('organizationId') as string
  const name = formData.get('name') as string
  const welcome_message = formData.get('welcome_message') as string
  const logo_url = formData.get('logo_url') as string
  const hero_image_url = formData.get('hero_image_url') as string
  
  // NEW FIELDS
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  const { error } = await supabase
    .from('organizations')
    .update({
      name,
      welcome_message,
      logo_url,
      hero_image_url,
      email, // Save email
      phone, // Save phone
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)

  if (error) {
    console.error('Error updating school settings:', error)
    return { success: false }
  }

  revalidatePath('/dashboard/school-settings')
  return { success: true }
}