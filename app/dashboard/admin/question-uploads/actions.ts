'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { parse } from 'csv-parse/sync'
// ✅ Import the new incremental generators
import { generatePracticeTestsAction, generateSubjectMockAction } from '@/app/dashboard/admin/subjects/actions'

// 1. Interface for Type Safety
interface CSVQuestionRow {
  [key: string]: string | undefined; 
}

// --- HELPER: Parse CSV and Insert ---
async function parseAndInsertQuestions(file: File, parentId: string) {
  const fileContent = await file.text()
  const supabase = await createClient()

  console.log(`[CSV] Processing file. Size: ${fileContent.length} bytes`)

  // 2. Parse CSV with Robust Header Normalization
  const records = parse(fileContent, {
    columns: (headers: string[]) => 
      headers.map(h => 
        h.trim()
         .toLowerCase()
         .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '') // Remove symbols
         .replace(/\s+/g, '_') // Space to underscore
      ),
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    bom: true 
  }) as CSVQuestionRow[]

  if (records.length === 0) {
    return { error: "Parsed 0 records. Check if CSV is empty." }
  }

  // Debug: Log headers to help troubleshoot missing columns
  console.log(`[CSV] Parsed ${records.length} rows. Headers:`, Object.keys(records[0]))

  let insertedCount = 0
  let skippedCount = 0
  let errors: string[] = []

  for (const [index, row] of records.entries()) {
    try {
      // 3. Robust Mapping (Handle multiple common header names)
      const qText = row.question || row.text || row.question_text || row.q || row.question_name
      const qDesc = row.description || row.direction || row.passage || row.instructions
      const qExp = row.explanation || row.rationale || row.solution || row.exp
      
      const optA = row.option_a || row.a || row.opt_a || row.option1
      const optB = row.option_b || row.b || row.opt_b || row.option2
      const optC = row.option_c || row.c || row.opt_c || row.option3
      const optD = row.option_d || row.d || row.opt_d || row.option4
      
      const correctVal = row.correct_option || row.answer || row.correct || row.ans || row.correct_answer || row.right_answer

      // Validate critical fields
      if (!qText || !optA || !optB || !correctVal) {
        console.warn(`[CSV] Skipping Row ${index + 1}: Missing critical data (Q, A, B, or Correct Answer).`)
        skippedCount++
        continue
      }

      // 4. Prepare Data
      const qData: any = {
        text: qText,
        direction: qDesc || null,
        explanation: qExp || '',
        order_index: index + 1,
        question_bank_id: parentId
      }

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

  console.log(`[CSV] Complete. Inserted: ${insertedCount}, Skipped: ${skippedCount}`)

  if (insertedCount === 0) {
    return { error: `Failed to insert questions. Errors: ${errors.slice(0, 3).join(', ')}` }
  }
  
  return { success: true, inserted: insertedCount }
}

// --- MAIN ACTION: Upload Bank & Trigger Auto-Generation ---
export async function uploadQuestionBankAction(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject_id = formData.get('subject_id') as string
  const csvFile = formData.get('csv_file') as File

  if (!csvFile || csvFile.size === 0) return { error: 'No file uploaded' }

  // 1. Create Question Bank Container (This appends to the Subject Pool)
  const { data: bank, error } = await supabase
    .from('question_banks')
    .insert({ 
      title: title || `Upload ${new Date().toLocaleDateString()}`, 
      description, 
      subject_id 
    })
    .select('id')
    .single()

  if (error) return { error: `Failed to create bank: ${error.message}` }

  // 2. Parse CSV & Insert Questions
  const result = await parseAndInsertQuestions(csvFile, bank.id)

  if (result?.error) {
    console.error("CSV Processing Failed:", result.error)
    // Rollback: Delete the empty bank if CSV fails
    await supabase.from('question_banks').delete().eq('id', bank.id)
    return { error: result.error || "CSV Upload Failed" }
  }

  // ------------------------------------------------------------------
  // 3. ✅ AUTO-GENERATE SUBJECT CONTENT (Incremental)
  // ------------------------------------------------------------------
  if (subject_id) {
    console.log(`[Auto-Gen] Updating Subject content for: ${subject_id}...`)
    
    // Wrap in separate try/catch so we don't fail the upload if generation has a hiccup
    try {
      // A. Create new Practice Sets for the NEW (unused) questions
      const practiceRes = await generatePracticeTestsAction(subject_id)
      if (!practiceRes.success) console.warn("Practice Gen Warning:", practiceRes.message)
      
      // B. Create a NEW Subject Mock using the EXPANDED pool (Archives old one)
      const mockRes = await generateSubjectMockAction(subject_id)
      if (!mockRes.success) console.warn("Mock Gen Warning:", mockRes.message)

    } catch (genError) {
      console.error("[Auto-Gen] Critical Error during generation:", genError)
      // Note: We do NOT throw here. The questions are uploaded safely.
    }
  }

  revalidatePath(`/dashboard/admin/subjects/${subject_id}/edit`)
  revalidatePath(`/dashboard/admin/manage-content`)
  
  return { success: true }
}