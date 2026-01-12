'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// -----------------------------------------------------------------------------
// SUBJECT CRUD ACTIONS
// -----------------------------------------------------------------------------

export async function createSubjectAction(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  const { error } = await supabase.from('subjects').insert({ title, course_id })
  
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/manage-content')
  revalidatePath('/dashboard/admin/subjects')
}

export async function updateSubjectAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  const { error } = await supabase.from('subjects').update({ title, course_id }).eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/manage-content')
  revalidatePath('/dashboard/admin/subjects')
}

export async function deleteSubjectAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  
  const { error } = await supabase.from('subjects').delete().eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/admin/manage-content')
  revalidatePath('/dashboard/admin/subjects')
}

// -----------------------------------------------------------------------------
// HELPER: FETCH QUESTIONS
// -----------------------------------------------------------------------------
async function getSubjectQuestions(subjectId: string) {
  const supabase = await createClient()
  
  // 1. Get Banks for this Subject
  const { data: banks } = await supabase
    .from('question_banks')
    .select('id')
    .eq('subject_id', subjectId)
    
  const bankIds = banks?.map(b => b.id) || []

  if (bankIds.length === 0) return []

  // 2. Get Questions (Select IDs and existing links to check usage)
  const { data: questions } = await supabase
    .from('questions')
    .select('id, practice_test_id, module_id')
    .in('question_bank_id', bankIds)

  return questions || []
}

// -----------------------------------------------------------------------------
// 1. GENERATE PREP MODULES (Incremental)
// -----------------------------------------------------------------------------
// Finds questions NOT assigned to a module yet and creates new modules for them.
export async function generatePrepModulesAction(subjectId: string) {
  const supabase = await createClient()
  const CHUNK_SIZE = 10

  try {
    const allQuestions = await getSubjectQuestions(subjectId)
    
    // Filter for unused questions
    // @ts-ignore
    const unusedQuestions = allQuestions.filter(q => !q.module_id)
    
    if (unusedQuestions.length === 0) {
      return { success: true, message: 'No new questions available for Prep Modules.' }
    }

    // Get current count to name new modules (e.g., "Prep Module 5")
    const { count } = await supabase
      .from('prep_modules')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', subjectId)
    
    let nextIndex = (count || 0) + 1
    let createdCount = 0

    // Create New Modules
    for (let i = 0; i < unusedQuestions.length; i += CHUNK_SIZE) {
      const chunk = unusedQuestions.slice(i, i + CHUNK_SIZE)
      
      // 1. Create Module
      const { data: moduleData, error: createError } = await supabase
        .from('prep_modules')
        .insert({
          subject_id: subjectId,
          title: `Prep Module ${nextIndex}`,
          description: `Auto-generated learning module with ${chunk.length} questions.`,
          difficulty: 'General',
          is_published: true
        })
        .select('id')
        .single()

      if (createError) throw new Error(createError.message)

      // 2. Link Questions (1:Many)
      const qIds = chunk.map(q => q.id)
      await supabase
        .from('questions')
        .update({ module_id: moduleData.id })
        .in('id', qIds)

      createdCount++
      nextIndex++
    }

    revalidatePath(`/courses`)
    return { success: true, message: `Added ${createdCount} new Prep Modules.` }

  } catch (error: any) {
    console.error("Prep Gen Error:", error)
    return { success: false, message: error.message }
  }
}

// -----------------------------------------------------------------------------
// 2. GENERATE PRACTICE TESTS (Incremental)
// -----------------------------------------------------------------------------
// Finds questions NOT assigned to a practice test yet and creates new sets.
export async function generatePracticeTestsAction(subjectId: string) {
  const supabase = await createClient()
  const CHUNK_SIZE = 20

  try {
    const allQuestions = await getSubjectQuestions(subjectId)
    
    // Filter for unused questions
    // @ts-ignore
    const unusedQuestions = allQuestions.filter(q => !q.practice_test_id)

    if (unusedQuestions.length === 0) {
      return { success: true, message: 'All questions are already in Practice Sets.' }
    }

    // Get current count
    const { count } = await supabase
      .from('practice_tests')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', subjectId)
    
    let nextIndex = (count || 0) + 1
    let createdCount = 0

    // Shuffle only the NEW questions
    const shuffled = unusedQuestions.sort(() => 0.5 - Math.random())

    for (let i = 0; i < shuffled.length; i += CHUNK_SIZE) {
      const chunk = shuffled.slice(i, i + CHUNK_SIZE)
      
      // 1. Create Test Container
      const { data: testData, error: createError } = await supabase
        .from('practice_tests')
        .insert({
          subject_id: subjectId,
          title: `Practice Set ${nextIndex}`,
          description: `Practice set with ${chunk.length} questions.`,
          duration_minutes: chunk.length, // 1 min per question
          is_published: true
        })
        .select('id')
        .single()

      if (createError) throw new Error(createError.message)

      // 2. Link Questions (1:Many)
      const qIds = chunk.map(q => q.id)
      await supabase
        .from('questions')
        .update({ practice_test_id: testData.id })
        .in('id', qIds)

      createdCount++
      nextIndex++
    }

    revalidatePath(`/courses`)
    return { success: true, message: `Created ${createdCount} new Practice Sets.` }

  } catch (error: any) {
    console.error("Practice Gen Error:", error)
    return { success: false, message: error.message }
  }
}

// -----------------------------------------------------------------------------
// 3. GENERATE SUBJECT MOCK EXAMS (Incremental & Active)
// -----------------------------------------------------------------------------
// Finds questions NOT used in any existing Subject Mock and creates NEW Active Mocks.
export async function generateSubjectMockAction(subjectId: string) {
  const supabase = await createClient()
  const MOCK_SIZE = 50 

  try {
    // 1. Fetch All Questions for Subject
    const allQuestions = await getSubjectQuestions(subjectId)
    if (allQuestions.length === 0) return { success: false, message: 'No questions found.' }

    // 2. Identify "Used" Questions (Already in a Subject Mock)
    // We fetch IDs of existing subject mocks, then questions in them.
    const { data: existingMocks } = await supabase
      .from('mock_tests')
      .select('id')
      .eq('subject_id', subjectId)

    const usedQuestionIds = new Set<string>()
    
    if (existingMocks && existingMocks.length > 0) {
      const mockIds = existingMocks.map(m => m.id)
      const { data: used } = await supabase
        .from('mock_test_questions')
        .select('question_id')
        .in('mock_test_id', mockIds)
      
      used?.forEach(u => usedQuestionIds.add(u.question_id))
    }

    // 3. Filter for Unused
    // @ts-ignore
    const unusedQuestions = allQuestions.filter(q => !usedQuestionIds.has(q.id))

    if (unusedQuestions.length === 0) {
      return { success: true, message: 'All questions already used in Subject Mocks.' }
    }

    // 4. Fetch Meta & Counts
    const { data: subject } = await supabase.from('subjects').select('course_id, title').eq('id', subjectId).single()
    const { count } = await supabase.from('mock_tests').select('*', { count: 'exact', head: true }).eq('subject_id', subjectId)
    
    let nextIndex = (count || 0) + 1
    let createdCount = 0

    // 5. Create NEW Mocks (Batching the new questions)
    const shuffled = unusedQuestions.sort(() => 0.5 - Math.random())

    for (let i = 0; i < shuffled.length; i += MOCK_SIZE) {
      const chunk = shuffled.slice(i, i + MOCK_SIZE)
      
      const duration = Math.ceil(chunk.length * 1.2)
      const totalMarks = chunk.length * 4

      // Create Mock Header
      const { data: mockData, error: createError } = await supabase
        .from('mock_tests')
        .insert({
          course_id: subject?.course_id,
          subject_id: subjectId, // ✅ Subject-Wise
          title: `${subject?.title || 'Subject'} Mock ${nextIndex}`,
          description: `Subject mock with ${chunk.length} questions.`,
          
          duration_minutes: duration,
          total_marks: totalMarks,
          marks_correct: 4,
          marks_incorrect: -1,
          marks_unattempted: 0,
          
          is_active: true // ✅ Always Active (Incremental)
        })
        .select('id')
        .single()

      if (createError) throw new Error(createError.message)

      // Link Questions
      const links = chunk.map(q => ({
        mock_test_id: mockData.id,
        question_id: q.id
      }))

      const { error: linkError } = await supabase.from('mock_test_questions').insert(links)
      if (linkError) throw new Error(linkError.message)

      createdCount++
      nextIndex++
    }

    revalidatePath(`/courses`)
    return { success: true, message: `Generated ${createdCount} new Subject Mocks.` }

  } catch (error: any) {
    console.error("Subject Mock Gen Error:", error)
    return { success: false, message: error.message }
  }
}

// NOTE: To support old references
export const generateMockTestsAction = generateSubjectMockAction;