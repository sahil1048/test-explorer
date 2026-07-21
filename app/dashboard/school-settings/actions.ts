'use server'

import { requireRole } from '@/lib/auth/require-role'
import { revalidatePath } from 'next/cache'

export async function updateSchoolSettingsAction(formData: FormData) {
  const { supabase, profile } = await requireRole(['school_admin', 'super_admin'])
  
  const requestedOrganizationId = formData.get('organizationId')
  const organizationId = profile.role === 'super_admin'
    ? String(requestedOrganizationId ?? '')
    : profile.organization_id

  if (!organizationId) return { success: false, error: 'No school is associated with this account.' }

  const name = String(formData.get('name') ?? '').trim()
  const welcome_message = String(formData.get('welcome_message') ?? '').trim()
  const logo_url = String(formData.get('logo_url') ?? '').trim()
  const hero_image_url = String(formData.get('hero_image_url') ?? '').trim()
  
  // NEW FIELDS
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  if (!name || name.length > 160 || welcome_message.length > 2000 || email.length > 320 || phone.length > 40) {
    return { success: false, error: 'Review the school details and try again.' }
  }

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
    console.error('School settings update failed', { code: error.code })
    return { success: false, error: 'School settings could not be saved.' }
  }

  revalidatePath('/dashboard/school-settings')
  return { success: true }
}
