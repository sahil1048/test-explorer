'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// -----------------------------------------------------------------------------
// 1. CREATE BLUEPRINT & GENERATE MOCKS
// -----------------------------------------------------------------------------
export async function createBlueprintAction(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Parse Form Data
  const course_id = formData.get('course_id') as string
  const title = formData.get('title') as string
  const duration = parseInt(formData.get('duration') as string)
  const total_marks = parseInt(formData.get('marks') as string)
  
  // Marking Scheme
  const marks_correct = parseFloat(formData.get('marks_correct') as string) || 4
  const marks_incorrect = parseFloat(formData.get('marks_incorrect') as string) || -1
  const marks_unattempted = parseFloat(formData.get('marks_unattempted') as string) || 0

  const subjectCounts = parseSubjectCounts(formData)

  // 2. Insert Blueprint Header
  const { data: blueprint, error: bpError } = await supabase
    .from('mock_blueprints')
    .insert({
      course_id,
      title,
      total_duration_minutes: duration,
      total_marks: total_marks
    })
    .select()
    .single()

  if (bpError) return { error: `Blueprint creation failed: ${bpError.message}` }

  // 3. Insert Blueprint Items (Rules)
  const items = subjectCounts.map(item => ({
    blueprint_id: blueprint.id,
    subject_id: item.subjectId,
    question_count: item.count
  }))

  if (items.length > 0) {
    const { error: itemError } = await supabase.from('mock_blueprint_items').insert(items)
    if (itemError) return { error: `Failed to save items: ${itemError.message}` }
  }

  // 4. AUTO-GENERATE MOCKS
  const result = await generateBulkMocks(blueprint, items, { 
    marks_correct, 
    marks_incorrect, 
    marks_unattempted 
  })

  revalidatePath('/dashboard/admin/blueprints')
  revalidatePath('/dashboard/admin/mocktest') 

  if (typeof result === 'object' && result !== null && 'error' in result) {
    return { success: true, generatedCount: 0, warning: result.error }
  }

  return { success: true, generatedCount: result as number }
}

// -----------------------------------------------------------------------------
// 2. UPDATE BLUEPRINT & RE-GENERATE MOCKS
// -----------------------------------------------------------------------------
export async function updateBlueprintAction(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const duration = parseInt(formData.get('duration') as string)
  const total_marks = parseInt(formData.get('marks') as string)

  const marks_correct = parseFloat(formData.get('marks_correct') as string) || 4
  const marks_incorrect = parseFloat(formData.get('marks_incorrect') as string) || -1
  const marks_unattempted = parseFloat(formData.get('marks_unattempted') as string) || 0
  
  const subjectCounts = parseSubjectCounts(formData)

  // 1. Update Header
  const { data: blueprint, error: bpError } = await supabase
    .from('mock_blueprints')
    .update({
      title,
      total_duration_minutes: duration,
      total_marks: total_marks
    })
    .eq('id', id)
    .select()
    .single()

  if (bpError) return { error: bpError.message }

  // 2. Update Items (Delete Old -> Insert New)
  await supabase.from('mock_blueprint_items').delete().eq('blueprint_id', id)

  const items = subjectCounts.map(item => ({
    blueprint_id: id,
    subject_id: item.subjectId,
    question_count: item.count
  }))

  if (items.length > 0) {
    const { error: insertError } = await supabase.from('mock_blueprint_items').insert(items)
    if (insertError) return { error: insertError.message }
  }

  // 3. AUTO-GENERATE MOCKS
  const result = await generateBulkMocks(blueprint, items, {
    marks_correct, 
    marks_incorrect, 
    marks_unattempted 
  })

  revalidatePath('/dashboard/admin/blueprints')
  revalidatePath('/dashboard/admin/mocktest')

  if (typeof result === 'object' && result !== null && 'error' in result) {
    return { success: true, generatedCount: 0, warning: result.error }
  }

  return { success: true, generatedCount: result as number }
}

export async function deleteBlueprintAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('mock_blueprints').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/blueprints')
  return { success: true }
}

// -----------------------------------------------------------------------------
// INTERNAL: BULK MOCK GENERATOR
// -----------------------------------------------------------------------------
async function generateBulkMocks(
  blueprint: any, 
  items: any[], 
  markingScheme: { marks_correct: number, marks_incorrect: number, marks_unattempted: number }
) {
  const supabase = await createClient()
  const errors: string[] = []

  // 1. Identify "Used" Questions
  // To ensure Exam Mocks are unique, we find questions already used in OTHER Exam Mocks.
  // We do NOT filter out questions used in Subject Mocks (practice), allowing overlap there.
  
  const { data: existingExamMocks } = await supabase
    .from('mock_tests')
    .select('id')
    .is('subject_id', null) // Only check Exam-Wise mocks

  let usedQuestionIds = new Set<string>()

  if (existingExamMocks && existingExamMocks.length > 0) {
    const mockIds = existingExamMocks.map(m => m.id)
    const { data: usedQuestions } = await supabase
      .from('mock_test_questions')
      .select('question_id')
      .in('mock_test_id', mockIds)
    
    usedQuestions?.forEach(q => usedQuestionIds.add(q.question_id))
  }

  // 2. Prepare Question Pools per Subject
  const subjectQuestionPool: Record<string, string[]> = {}

  for (const item of items) {
    if (item.question_count <= 0) continue

    // A. Get Question Banks for Subject
    const { data: banks } = await supabase.from('question_banks').select('id').eq('subject_id', item.subject_id)
    const bankIds = banks?.map(b => b.id) || []
    
    if (bankIds.length === 0) {
       subjectQuestionPool[item.subject_id] = []
       continue
    }

    // B. Fetch All Questions for these Banks
    const { data: questions } = await supabase
      .from('questions')
      .select('id')
      .in('question_bank_id', bankIds)
    
    // C. Filter out "Used in Exam" questions
    const availableIds = questions
      ?.map(q => q.id)
      .filter(id => !usedQuestionIds.has(id)) || []
    
    // Shuffle the available pool
    subjectQuestionPool[item.subject_id] = availableIds.sort(() => 0.5 - Math.random())

    if (availableIds.length < item.question_count) {
       errors.push(`Subject ID ${item.subject_id}: Needs ${item.question_count}, found ${availableIds.length} unique questions.`)
    }
  }

  // 3. Calculate "Max Possible Tests"
  // E.g., if Physics has 100 Qs and we need 10 per test, we can make 10 tests.
  // If Math has 20 Qs and we need 5 per test, we can make 4 tests.
  // The limit is the lowest number (4).
  let maxTests = Infinity
  for (const item of items) {
    if (item.question_count <= 0) continue
    const poolSize = subjectQuestionPool[item.subject_id]?.length || 0
    const possible = Math.floor(poolSize / item.question_count)
    if (possible < maxTests) maxTests = possible
  }

  if (maxTests === Infinity) maxTests = 0 
  if (maxTests === 0) {
    if (errors.length > 0) return { error: `Not enough unique questions. ${errors[0]}` }
    return 0
  }

  // 4. Generation Loop
  let testsCreated = 0

  for (let i = 0; i < maxTests; i++) {
    const timestamp = new Date().getTime().toString().slice(-4)
    const mockTitle = `${blueprint.title} - Set ${i + 1} (${timestamp})`
    
    // A. Create Mock Header (Exam-Wise)
    const { data: mockTest, error: mockError } = await supabase
      .from('mock_tests')
      .insert({
        title: mockTitle,
        description: `Full syllabus mock generated from ${blueprint.title}.`,
        course_id: blueprint.course_id,
        subject_id: null, // ✅ NULL = Exam-Wise Mock (Critical for architecture)
        
        duration_minutes: blueprint.total_duration_minutes,
        total_marks: blueprint.total_marks,
        
        // ✅ Marking Scheme
        marks_correct: markingScheme.marks_correct,
        marks_incorrect: markingScheme.marks_incorrect,
        marks_unattempted: markingScheme.marks_unattempted,
        
        is_active: true
      })
      .select('id')
      .single()
      
    if (mockError || !mockTest) {
      console.error("Failed to create mock_test iteration", i, mockError)
      continue
    }

    // B. Allocate Questions
    let allQuestionsForMock: any[] = []
    
    for (const item of items) {
      if (item.question_count <= 0) continue
      
      // Cut questions from the pool so they aren't reused in the next iteration
      const pool = subjectQuestionPool[item.subject_id]
      const selectedIds = pool.splice(0, item.question_count)
      
      if (selectedIds.length > 0) {
        const links = selectedIds.map(qid => ({
          mock_test_id: mockTest.id,
          question_id: qid
        }))
        allQuestionsForMock = [...allQuestionsForMock, ...links]
      }
    }

    // C. Save Links
    if (allQuestionsForMock.length > 0) {
      const { error: linkError } = await supabase.from('mock_test_questions').insert(allQuestionsForMock)
      if (linkError) {
        console.error("Failed to link questions", linkError)
        // Optional: Cleanup the empty mock header if linking failed
        await supabase.from('mock_tests').delete().eq('id', mockTest.id)
      } else {
        testsCreated++
      }
    }
  }

  return testsCreated
}

// --- HELPER ---
function parseSubjectCounts(formData: FormData) {
  const subjectCounts: { subjectId: string, count: number }[] = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('subject_count_') && Number(value) > 0) {
      subjectCounts.push({
        subjectId: key.replace('subject_count_', ''),
        count: Number(value)
      })
    }
  }
  return subjectCounts
}