'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. Create a Blueprint & Auto-Generate Mocks ---
export async function createBlueprintAction(formData: FormData) {
  const supabase = await createClient()
  
  const course_id = formData.get('course_id') as string
  const title = formData.get('title') as string
  const duration = parseInt(formData.get('duration') as string)
  const total_marks = parseInt(formData.get('marks') as string)
  
  // ✅ NEW: Capture Marking Scheme
  const marks_correct = parseFloat(formData.get('marks_correct') as string) || 4
  const marks_incorrect = parseFloat(formData.get('marks_incorrect') as string) || -1
  const marks_unattempted = parseFloat(formData.get('marks_unattempted') as string) || 0

  const subjectCounts = parseSubjectCounts(formData)

  // 1. Create Blueprint Header
  // (Optional: If you added these columns to 'mock_blueprints' table, save them here too. 
  // For now, we just use them for generation.)
  const { data: blueprint, error: bpError } = await supabase
    .from('mock_blueprints')
    .insert({
      course_id,
      title,
      total_duration_minutes: duration,
      total_marks: total_marks
    })
    .select('id, title, course_id, total_duration_minutes, total_marks')
    .single()

  if (bpError) return { error: bpError.message }

  // 2. Create Items
  const items = subjectCounts.map(item => ({
    blueprint_id: blueprint.id,
    subject_id: item.subjectId,
    question_count: item.count
  }))

  const { error: itemError } = await supabase.from('mock_blueprint_items').insert(items)
  if (itemError) return { error: itemError.message }

  // 3. AUTO-GENERATE MOCKS (Pass the marking scheme)
  const result = await generateBulkMocks(blueprint, items, { 
    marks_correct, 
    marks_incorrect, 
    marks_unattempted 
  })

  // Handle Result
  if (typeof result === 'object' && result !== null && 'error' in result) {
    return { success: true, generatedCount: 0, warning: result.error }
  }

  revalidatePath('/dashboard/admin/blueprints')
  revalidatePath('/dashboard/admin/mocktest') 
  return { success: true, generatedCount: result as number }
}

// --- 2. Update Blueprint & Auto-Generate Mocks ---
export async function updateBlueprintAction(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const duration = parseInt(formData.get('duration') as string)
  const total_marks = parseInt(formData.get('marks') as string)

  // ✅ NEW: Capture Marking Scheme
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
    .select('id, title, course_id, total_duration_minutes, total_marks')
    .single()

  if (bpError) return { error: bpError.message }

  // 2. Replace Items
  const { error: deleteError } = await supabase.from('mock_blueprint_items').delete().eq('blueprint_id', id)
  if (deleteError) return { error: deleteError.message }

  const items = subjectCounts.map(item => ({
    blueprint_id: id,
    subject_id: item.subjectId,
    question_count: item.count
  }))

  const { error: insertError } = await supabase.from('mock_blueprint_items').insert(items)
  if (insertError) return { error: insertError.message }

  // 3. AUTO-GENERATE MOCKS (Pass the marking scheme)
  const result = await generateBulkMocks(blueprint, items, {
    marks_correct, 
    marks_incorrect, 
    marks_unattempted 
  })

  if (typeof result === 'object' && result !== null && 'error' in result) {
    return { success: true, generatedCount: 0, warning: result.error }
  }

  revalidatePath('/dashboard/admin/blueprints')
  revalidatePath('/dashboard/admin/mocktest')
  return { success: true, generatedCount: result as number }
}

export async function deleteBlueprintAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('mock_blueprints').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/admin/blueprints')
  return { success: true }
}

// --- INTERNAL: Bulk Generator Logic (MOCK_TESTS Table) ---
async function generateBulkMocks(
  blueprint: any, 
  items: any[], 
  markingScheme: { marks_correct: number, marks_incorrect: number, marks_unattempted: number }
) {
  const supabase = await createClient()
  const errors: string[] = []

  // 0. Fetch IDs of questions ALREADY used in other mock tests
  const { data: usedQuestions } = await supabase.from('mock_test_questions').select('question_id')
  const usedQuestionIds = new Set(usedQuestions?.map(u => u.question_id) || [])

  // 1. Prepare Pools
  const subjectQuestionPool: Record<string, string[]> = {}

  for (const item of items) {
    if (item.question_count <= 0) continue

    // A. Get Banks
    const { data: banks } = await supabase.from('question_banks').select('id').eq('subject_id', item.subject_id)
    const bankIds = banks?.map(b => b.id) || []
    
    if (bankIds.length === 0) {
       const { data: sub } = await supabase.from('subjects').select('title').eq('id', item.subject_id).single()
       errors.push(`${sub?.title || 'Subject'} has NO Question Banks.`)
       subjectQuestionPool[item.subject_id] = []
       continue
    }

    // B. Fetch Questions
    const { data: questions } = await supabase
      .from('questions')
      .select('id')
      .in('question_bank_id', bankIds)
      .is('exam_id', null) 
    
    // C. Filter Used
    const availableIds = questions?.map(q => q.id).filter(id => !usedQuestionIds.has(id)) || []
    
    // Shuffle
    subjectQuestionPool[item.subject_id] = availableIds.sort(() => 0.5 - Math.random())

    if (availableIds.length < item.question_count) {
       const { data: sub } = await supabase.from('subjects').select('title').eq('id', item.subject_id).single()
       errors.push(`${sub?.title}: Needs ${item.question_count}/test, found ${availableIds.length} unused.`)
    }
  }

  if (errors.length > 0) console.error("Auto-Gen Errors:", errors)

  // 2. Calculate Capacity
  let maxTests = Infinity
  for (const item of items) {
    if (item.question_count <= 0) continue
    const poolSize = subjectQuestionPool[item.subject_id]?.length || 0
    const possible = Math.floor(poolSize / item.question_count)
    if (possible < maxTests) maxTests = possible
  }

  if (maxTests === Infinity) maxTests = 0 
  if (maxTests === 0) {
    if (errors.length > 0) return { error: errors.join(" | ") }
    return 0
  }

  // 3. Generate Loop
  let testsCreated = 0

  for (let i = 0; i < maxTests; i++) {
    const mockTitle = `${blueprint.title} - Mock ${new Date().getTime().toString().slice(-4)}${i + 1}`
    
    // A. Create Mock Test Record WITH MARKING SCHEME
    const { data: mockTest, error: mockError } = await supabase
      .from('mock_tests')
      .insert({
        title: mockTitle,
        description: `Auto-generated from ${blueprint.title}`,
        course_id: blueprint.course_id,
        duration_minutes: blueprint.total_duration_minutes,
        total_marks: blueprint.total_marks,
        
        // ✅ INSERT MARKING SCHEME HERE
        marks_correct: markingScheme.marks_correct,
        marks_incorrect: markingScheme.marks_incorrect,
        marks_unattempted: markingScheme.marks_unattempted
      })
      .select('id')
      .single()
      
    if (mockError || !mockTest) {
      console.error("Failed to create mock_test iteration", i, mockError)
      continue
    }

    // B. Assign Questions
    let allQuestionsForMock: any[] = []
    for (const item of items) {
      if (item.question_count <= 0) continue
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

    if (allQuestionsForMock.length > 0) {
      const { error: linkError } = await supabase.from('mock_test_questions').insert(allQuestionsForMock)
      if (linkError) {
        console.error("Failed to link questions", linkError)
      } else {
        testsCreated++
      }
    }
  }

  return testsCreated
}

// --- Helper ---
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