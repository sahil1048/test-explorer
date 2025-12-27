'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { parse } from 'csv-parse/sync'

// 1. Robust Interface (Flexible Headers)
interface CSVQuestionRow {
  [key: string]: string | undefined; // Allow dynamic access
  
  description?: string;
  direction?: string;
  passage?: string;
  
  question?: string;
  text?: string;
  q?: string;
  
  option_a?: string;
  a?: string;
  
  option_b?: string;
  b?: string;
  
  option_c?: string;
  c?: string;
  
  option_d?: string;
  d?: string;
  
  correct_option?: string;
  answer?: string;
  correct?: string;
  ans?: string;
  
  explanation?: string;
  rationale?: string;
}

// --- HELPER: Parse CSV and Insert ---
async function parseAndInsertQuestions(
  file: File, 
  parentId: string, 
  type: 'prep' | 'mock' | 'practice'
) {
  const fileContent = await file.text()
  const supabase = await createClient()

  console.log(`[CSV] Processing file for ${type} (ID: ${parentId}). Size: ${fileContent.length} bytes`)

  // 2. Parse CSV with Robust Header Normalization
  const records = parse(fileContent, {
    columns: (headers: string[]) => 
      headers.map(h => 
        h.trim()
         .toLowerCase()
         .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '') // Trim symbols
         .replace(/\s+/g, '_') // Spaces to underscores
      ),
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    bom: true // Handles Excel hidden characters
  }) as CSVQuestionRow[]

  if (records.length === 0) {
    throw new Error("Parsed 0 records. Check if CSV is empty.")
  }

  console.log(`[CSV] Parsed ${records.length} rows. Headers:`, Object.keys(records[0]))

  let insertedCount = 0
  let errors: string[] = []

  for (const [index, row] of records.entries()) {
    try {
      // 3. Robust Mapping
      const qText = row.question || row.text || row.question_text || row.q
      const qDesc = row.description || row.direction || row.passage || row.instructions
      const qExp = row.explanation || row.rationale || row.solution || row.exp
      
      const optA = row.option_a || row.a || row.opt_a
      const optB = row.option_b || row.b || row.opt_b
      const optC = row.option_c || row.c || row.opt_c
      const optD = row.option_d || row.d || row.opt_d
      
      const correctVal = row.correct_option || row.answer || row.correct || row.ans

      if (!qText || !optA || !optB || !correctVal) {
        console.warn(`[CSV] Row ${index + 1} Skipped. Missing Data.`)
        continue
      }

      // 4. Prepare Data based on Type
      const qData: any = {
        text: qText,
        direction: qDesc || null,
        explanation: qExp || '',
        order_index: index + 1
      }

      // Assign the correct Foreign Key
      if (type === 'prep') qData.module_id = parentId
      else if (type === 'mock') qData.exam_id = parentId
      else if (type === 'practice') qData.practice_test_id = parentId

      // 5. Insert Question
      const { data: question, error: qError } = await supabase
        .from('questions')
        .insert(qData)
        .select()
        .single()

      if (qError) throw new Error(`DB Insert Error: ${qError.message}`)

      // 6. Insert Options
      const rawOptions = [
        { text: optA, label: 'A' },
        { text: optB, label: 'B' },
        { text: optC, label: 'C' },
        { text: optD, label: 'D' },
      ]
      
      const cleanCorrect = correctVal.toString().trim().replace(/^Option\s+/i, '')

      const optionsData = rawOptions
        .filter(o => o.text && o.text.trim() !== '')
        .map(opt => {
          const isCorrect = 
            cleanCorrect.toUpperCase() === opt.label || 
            (opt.text && cleanCorrect.toLowerCase() === opt.text.toString().toLowerCase())

          return {
            question_id: question.id,
            text: opt.text,
            is_correct: isCorrect
          }
        })

      const { error: optError } = await supabase.from('question_options').insert(optionsData)
      if (optError) throw new Error(`Option Insert Error: ${optError.message}`)

      insertedCount++

    } catch (err: any) {
      console.error(`[CSV] Error Row ${index + 1}:`, err.message)
      errors.push(`Row ${index + 1}: ${err.message}`)
    }
  }

  console.log(`[CSV] Complete. Inserted: ${insertedCount}`)
  
  if (insertedCount === 0) {
    throw new Error(`Failed to insert any questions. ${errors.length > 0 ? errors[0] : 'Check CSV format.'}`)
  }
}

// --- ACTIONS ---

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
  try {
    if (type === 'prep') {
      const { data, error } = await supabase.from('prep_modules').insert({ title, description, subject_id, is_published }).select('id').single()
      if (error) throw error
      newRecordId = data.id
    } 
    else if (type === 'mock') {
      const { data, error } = await supabase.from('exams').insert({ title, description, subject_id, duration_minutes: duration, is_published, category: 'mock' }).select('id').single()
      if (error) throw error
      newRecordId = data.id
    } 
    else if (type === 'practice') {
      const { data, error } = await supabase.from('practice_tests').insert({ title, description, subject_id, duration_minutes: duration, is_published }).select('id').single()
      if (error) throw error
      newRecordId = data.id
    }

    // 2. Process CSV if uploaded
    if (newRecordId && csvFile && csvFile.size > 0) {
      await parseAndInsertQuestions(csvFile, newRecordId, type)
    }
  } catch (error: any) {
    console.error("Creation Failed:", error)
    // Optional: cleanup if failed
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/exams')
  redirect('/dashboard/admin/exams')
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

  const updatePayload: any = { title, description, subject_id, is_published }
  if (type !== 'prep') {
    updatePayload.duration_minutes = duration
  }

  const { error } = await supabase
    .from(table)
    .update(updatePayload)
    .eq('id', id)

  if (error) throw new Error(error.message)

  // 2. Process CSV if uploaded (Appending questions to existing exam)
  if (csvFile && csvFile.size > 0) {
    try {
      await parseAndInsertQuestions(csvFile, id, type)
    } catch (error: any) {
      console.error("Update CSV Failed:", error)
      throw new Error("Failed to process CSV: " + error.message)
    }
  }

  revalidatePath('/dashboard/admin/exams')
  redirect('/dashboard/admin/exams')
}

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

export async function deleteQuestionAction(formData: FormData) {
  const supabase = await createClient()
  const questionId = formData.get('question_id') as string
  const examId = formData.get('exam_id') as string
  
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/admin/exams/${examId}/edit`)
}

export async function deleteAllQuestionsAction(formData: FormData) {
  const supabase = await createClient()
  const examId = formData.get('exam_id') as string
  const type = formData.get('exam_type') as string

  let questionFK = 'module_id' 
  if (type === 'mock') questionFK = 'exam_id'
  else if (type === 'practice') questionFK = 'practice_test_id'

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq(questionFK, examId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/admin/exams/${examId}/edit`)
}