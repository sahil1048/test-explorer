'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- CREATE TESTIMONIAL ---
export async function createTestimonialAction(formData: FormData) {
  const supabase = await createClient()

  // 1. Authenticate & Get the Admin's School ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return { error: 'You are not assigned to a school.' }
  }

  // 2. Extract Data from the Form
  const student_name = (formData.get('student_name') as string || '').trim()
  const course_name = (formData.get('course_name') as string || '').trim()
  const message = (formData.get('message') as string || '').trim()
  const student_image = (formData.get('student_image') as string || '').trim()

  // 3. Basic Validation
  if (!student_name || !message) {
    return { error: 'Student Name and Message are required.' }
  }

  // 4. Insert into Database
  const { error } = await supabase
    .from('school_testimonials')
    .insert({
      organization_id: profile.organization_id, // Automatically links to their school
      student_name,
      course_name,
      message,
      student_image
    })

  if (error) {
    console.error("Error inserting testimonial:", error)
    return { error: 'Failed to add testimonial. Please try again.' }
  }

  // 5. Refresh Pages
  revalidatePath('/dashboard/admin/testimonials')
  revalidatePath('/') // Refreshes the main landing page to show the new testimonial
  return { success: true }
}

// --- DELETE TESTIMONIAL ---
export async function deleteTestimonialAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  if (!id) return { error: 'Testimonial ID required' }

  // Delete the specific testimonial
  const { error } = await supabase
    .from('school_testimonials')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Error deleting testimonial:", error)
    return { error: 'Failed to delete testimonial.' }
  }

  // Refresh Pages
  revalidatePath('/dashboard/admin/testimonials')
  revalidatePath('/') 
  return { success: true }
}