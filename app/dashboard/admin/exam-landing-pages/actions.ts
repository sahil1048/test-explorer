'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// FETCH ALL EXAMS
export async function getExamLandingPages() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, slug, is_published, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// FETCH SINGLE EXAM DETAILS
export async function getExamDetails(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// UPDATE EXAM DETAILS (The heavy lifter)
export async function updateExamDetails(id: string, details: any) {
  const supabase = await createClient()
  
  // We only update the 'details' jsonb column
  const { error } = await supabase
    .from('courses')
    .update({ details })
    .eq('id', id)

  if (error) return { success: false, message: error.message }
  
  revalidatePath(`/dashboard/admin/exam-landing-pages/${id}`)
  revalidatePath('/dashboard/admin/exam-landing-pages')
  return { success: true, message: 'Saved successfully' }
}

// DELETE EXAM
export async function deleteExam(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('courses').delete().eq('id', id)

  if (error) return { success: false, message: error.message }
  
  revalidatePath('/dashboard/admin/exam-landing-pages')
  return { success: true, message: 'Deleted successfully' }
}

// CREATE NEW EXAM STUB
export async function createExamStub(title: string, slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .insert([{ title, slug, details: {} }]) // Start with empty details
    .select()
    .single()

  if (error) return { success: false, message: error.message }
  
  revalidatePath('/dashboard/admin/exam-landing-pages')
  return { success: true, id: data.id }
}