'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. Create a Blueprint ---
export async function createBlueprintAction(formData: FormData) {
  const supabase = await createClient()
  
  const course_id = formData.get('course_id') as string
  const title = formData.get('title') as string
  const duration = parseInt(formData.get('duration') as string)
  const marks = parseInt(formData.get('marks') as string)
  
  // Parse the dynamic subject counts from the form
  // Expecting inputs like: subject_count_{subjectId}
  const subjectCounts: { subjectId: string, count: number }[] = []
  
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('subject_count_') && Number(value) > 0) {
      subjectCounts.push({
        subjectId: key.replace('subject_count_', ''),
        count: Number(value)
      })
    }
  }

  // 1. Create Blueprint Header
  const { data: blueprint, error: bpError } = await supabase
    .from('mock_blueprints')
    .insert({
      course_id,
      title,
      total_duration_minutes: duration,
      total_marks: marks
    })
    .select('id')
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

  revalidatePath('/dashboard/admin/blueprints')
  return { success: true }
}

// --- 2. Generate a Mock Exam from Blueprint ---
export async function generateMockFromBlueprintAction(blueprintId: string) {
  const supabase = await createClient()

  // 1. Fetch Blueprint & Items
  const { data: bp } = await supabase
    .from('mock_blueprints')
    .select('*, items:mock_blueprint_items(*)')
    .eq('id', blueprintId)
    .single()

  if (!bp) return { error: "Blueprint not found" }

  // 2. Create the Exam Record
  const examTitle = `${bp.title} - Generated ${new Date().toLocaleDateString()}`
  
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .insert({
      title: examTitle,
      description: `Full Mock Test based on ${bp.title}`,
      course_id: bp.course_id,
      duration_minutes: bp.total_duration_minutes,
      total_marks: bp.total_marks,
      category: 'mock',
      is_published: true
    })
    .select('id')
    .single()

  if (examError) return { error: examError.message }

  // 3. Fetch & Link Questions for EACH Subject in Blueprint
  let totalLinked = 0

  for (const item of bp.items) {
    // A. Get Pool IDs for this Subject
    const { data: banks } = await supabase
      .from('question_banks')
      .select('id')
      .eq('subject_id', item.subject_id)
    
    const bankIds = banks?.map(b => b.id) || []
    if (bankIds.length === 0) continue

    // B. Fetch Random Questions
    // Note: This fetches IDs first to shuffle in JS. 
    // For production scaling, use a database function `random()`.
    const { data: allQuestions } = await supabase
      .from('questions')
      .select('id')
      .in('question_bank_id', bankIds)
    
    if (!allQuestions || allQuestions.length === 0) continue

    // C. Shuffle & Slice
    const shuffled = allQuestions.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, item.question_count)
    const selectedIds = selected.map(q => q.id)

    // D. Link to Exam (Update foreign key)
    if (selectedIds.length > 0) {
      await supabase
        .from('questions')
        .update({ exam_id: exam.id })
        .in('id', selectedIds)
      
      totalLinked += selectedIds.length
    }
  }

  revalidatePath('/dashboard/admin/blueprints')
  return { success: true, count: totalLinked, examId: exam.id }
}