'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAnnouncementAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get Admin's School ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) throw new Error('No school assigned')

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const { error } = await supabase
    .from('school_announcements')
    .insert({
      organization_id: profile.organization_id,
      title,
      content
    })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/announcements')
  revalidatePath('/') // Revalidate landing pages if cached
}

export async function deleteAnnouncementAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('school_announcements')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/announcements')
}