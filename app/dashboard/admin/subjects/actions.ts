'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ... existing create/update/delete actions ...

export async function createSubjectAction(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  const { error } = await supabase.from('subjects').insert({ title, course_id })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/manage-content')
}

export async function updateSubjectAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  const { error } = await supabase.from('subjects').update({ title, course_id }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/manage-content')
}

export async function deleteSubjectAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const { error } = await supabase.from('subjects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/manage-content')
}


// --- HELPER: Generic Generator ---
async function generateContentFromBank(
  subjectId: string, 
  table: 'prep_modules' | 'exams' | 'practice_tests',
  chunkSize: number,
  titlePrefix: string,
  foreignKey: 'module_id' | 'exam_id' | 'practice_test_id'
) {
  const supabase = await createClient()

  try {
    // 1. Fetch Question Bank IDs for this Subject
    const { data: banks, error: bankError } = await supabase
      .from('question_banks')
      .select('id')
      .eq('subject_id', subjectId)

    if (bankError) throw new Error(bankError.message)
    
    const bankIds = banks.map(b => b.id)
    
    if (bankIds.length === 0) {
      return { success: false, message: 'No Question Banks found for this subject.' }
    }

    // 2. Fetch Questions IN those banks
    const { data: questions, error: fetchError } = await supabase
      .from('questions')
      .select('id')
      .in('question_bank_id', bankIds)

    if (fetchError) throw new Error(fetchError.message)
    if (!questions || questions.length === 0) {
      return { success: false, message: 'Pool is empty. Upload questions first.' }
    }

    // 3. Clear Existing Links (Reset)
    // We set the specific container ID to NULL for these questions to "free" them
    await supabase
      .from('questions')
      .update({ [foreignKey]: null })
      .in('id', questions.map(q => q.id))

    // 4. DELETE Existing Containers (Clean Slate)
    await supabase.from(table).delete().eq('subject_id', subjectId)

    // 5. Shuffle Questions
    const shuffled = [...questions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 6. Chunk & Create
    const chunks = []
    for (let i = 0; i < shuffled.length; i += chunkSize) {
      chunks.push(shuffled.slice(i, i + chunkSize))
    }

    let createdCount = 0
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const count = chunk.length
      const num = i + 1
      
      let payload: any = {
        title: `${titlePrefix} ${num}`,
        description: `Auto-generated set containing ${count} questions.`,
        subject_id: subjectId,
        is_published: true
      }

      if (table === 'exams') {
        payload.category = 'mock'
        payload.duration_minutes = Math.ceil(count * 1.2) 
      } else if (table === 'practice_tests') {
        payload.duration_minutes = count 
      }

      // Create Container
      const { data: container, error: createError } = await supabase
        .from(table)
        .insert(payload)
        .select('id')
        .single()

      if (createError) throw new Error(createError.message)

      // Link Questions
      const qIds = chunk.map(q => q.id)
      await supabase
        .from('questions')
        .update({ [foreignKey]: container.id })
        .in('id', qIds)
      
      createdCount++
    }

    revalidatePath(`/dashboard/admin/subjects/${subjectId}/edit`)
    return { success: true, message: `Successfully generated ${createdCount} ${titlePrefix}s!` }

  } catch (error: any) {
    console.error(error)
    return { success: false, message: error.message }
  }
}

// --- PUBLIC ACTIONS ---

export async function generatePrepModulesAction(subjectId: string) {
  return generateContentFromBank(subjectId, 'prep_modules', 10, 'Prep Module', 'module_id')
}

export async function generatePracticeTestsAction(subjectId: string) {
  return generateContentFromBank(subjectId, 'practice_tests', 20, 'Practice Set', 'practice_test_id')
}

export async function generateMockTestsAction(subjectId: string) {
  return generateContentFromBank(subjectId, 'exams', 50, 'Mock Exam', 'exam_id')
}
