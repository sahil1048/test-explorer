'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- HELPER: Parse CSV ---
// Simple parser: Assumes header row + columns: Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation
async function parseAndInsertQuestions(file: File, parentId: string, type: 'prep' | 'mock' | 'practice') {
  const text = await file.text()
  const rows = text.split('\n').filter(r => r.trim() !== '')
  const supabase = await createClient()

  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    // Basic CSV splitting (handling commas inside quotes is complex, this is a simple splitter)
    // For production, consider using a library like 'papaparse'
    const cols = rows[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    
    if (cols.length < 6) continue // Skip invalid rows

    const [qText, optA, optB, optC, optD, correctAns, explanation] = cols

    // 1. Insert Question
    const qData: any = {
      text: qText,
      explanation: explanation || '',
      order_index: i
    }
    
    // Link to correct parent
    if (type === 'prep') qData.module_id = parentId
    else if (type === 'mock') qData.exam_id = parentId
    else if (type === 'practice') qData.practice_test_id = parentId

    const { data: question, error: qError } = await supabase
      .from('questions')
      .insert(qData)
      .select()
      .single()

    if (qError) {
      console.error(`Row ${i} Error:`, qError.message)
      continue
    }

    // 2. Insert Options
    const options = [
      { text: optA, is_correct: correctAns.toLowerCase() === 'a' || correctAns === optA },
      { text: optB, is_correct: correctAns.toLowerCase() === 'b' || correctAns === optB },
      { text: optC, is_correct: correctAns.toLowerCase() === 'c' || correctAns === optC },
      { text: optD, is_correct: correctAns.toLowerCase() === 'd' || correctAns === optD },
    ]

    const optionsData = options.map(o => ({
      question_id: question.id,
      text: o.text,
      is_correct: o.is_correct
    }))

    await supabase.from('question_options').insert(optionsData)
  }
}

// --- CREATE ACTION ---
export async function createExamAction(formData: FormData) {
  const supabase = await createClient()
  
  const type = formData.get('type') as 'prep' | 'mock' | 'practice'
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject_id = formData.get('subject_id') as string
  const duration = parseInt(formData.get('duration') as string) || 0
  const is_published = formData.get('is_published') === 'on'
  const csvFile = formData.get('csv_file') as File

  let newRecordId = null

  // 1. Insert into correct table
  if (type === 'prep') {
    const { data, error } = await supabase.from('prep_modules').insert({ title, description, subject_id, is_published }).select('id').single()
    if (error) throw new Error(error.message)
    newRecordId = data.id
  } 
  else if (type === 'mock') {
    const { data, error } = await supabase.from('exams').insert({ title, description, subject_id, duration_minutes: duration, is_published, category: 'mock' }).select('id').single()
    if (error) throw new Error(error.message)
    newRecordId = data.id
  } 
  else if (type === 'practice') {
    const { data, error } = await supabase.from('practice_tests').insert({ title, description, subject_id, duration_minutes: duration, is_published }).select('id').single()
    if (error) throw new Error(error.message)
    newRecordId = data.id
  }

  // 2. Process CSV if uploaded
  if (newRecordId && csvFile && csvFile.size > 0) {
    await parseAndInsertQuestions(csvFile, newRecordId, type)
  }

  revalidatePath('/dashboard/admin/exams')
  redirect('/dashboard/admin/exams')
}

// --- DELETE ACTION ---
export async function deleteExamAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const type = formData.get('type') as string

  let table = ''
  if (type === 'prep') table = 'prep_modules'
  else if (type === 'mock') table = 'exams'
  else if (type === 'practice') table = 'practice_tests'

  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/exams')
}

export async function updateExamAction(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const type = formData.get('type') as 'prep' | 'mock' | 'practice'
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject_id = formData.get('subject_id') as string
  const duration = parseInt(formData.get('duration') as string) || 0
  const is_published = formData.get('is_published') === 'on'
  const csvFile = formData.get('csv_file') as File

  let table = ''
  if (type === 'prep') table = 'prep_modules'
  else if (type === 'mock') table = 'exams'
  else if (type === 'practice') table = 'practice_tests'

  // 1. Update Basic Info
  const updatePayload: any = { title, description, subject_id, is_published }
  if (type !== 'prep') {
    updatePayload.duration_minutes = duration
  }

  const { error } = await supabase
    .from(table)
    .update(updatePayload)
    .eq('id', id)

  if (error) throw new Error(error.message)

  // 2. Process CSV if uploaded (Adds NEW questions)
  if (csvFile && csvFile.size > 0) {
    // Reusing the helper from the create action
    await parseAndInsertQuestions(csvFile, id, type)
  }

  revalidatePath('/dashboard/admin/exams')
  redirect('/dashboard/admin/exams')
}

export async function deleteQuestionAction(formData: FormData) {
  const supabase = await createClient()
  const questionId = formData.get('question_id') as string
  const examId = formData.get('exam_id') as string
  
  // Delete the question (Options will cascade delete automatically)
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) throw new Error(error.message)

  // Revalidate the edit page so the list updates immediately
  revalidatePath(`/dashboard/admin/exams/${examId}/edit`)
}

export async function deleteAllQuestionsAction(formData: FormData) {
  const supabase = await createClient()
  const examId = formData.get('exam_id') as string
  const type = formData.get('exam_type') as string

  // Determine the correct foreign key based on type
  let questionFK = 'module_id' // default for 'prep'
  if (type === 'mock') questionFK = 'exam_id'
  else if (type === 'practice') questionFK = 'practice_test_id'

  // Delete all questions where the foreign key matches the exam ID
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq(questionFK, examId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/admin/exams/${examId}/edit`)
}