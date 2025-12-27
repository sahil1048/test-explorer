'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { parse } from 'csv-parse/sync'

// 1. Interface for Type Safety
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
  
  explanation?: string;
  rationale?: string;
}

// --- HELPER: Parse CSV and Insert ---
async function parseAndInsertQuestions(file: File, parentId: string) {
  const fileContent = await file.text()
  const supabase = await createClient()

  console.log(`[CSV] Processing file. Size: ${fileContent.length} bytes`)

  // 2. Parse CSV with Correct Header Transformation
  const records = parse(fileContent, {
    // FIX: Input is an ARRAY of strings (headers), so we map over them
    columns: (headers: string[]) => 
      headers.map(h => 
        h.trim()
         .toLowerCase()
         .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '') // Remove symbols start/end
         .replace(/\s+/g, '_') // Space to underscore
      ),
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    bom: true 
  }) as CSVQuestionRow[]

  if (records.length === 0) {
    throw new Error("Parsed 0 records. Check if CSV is empty.")
  }

  console.log(`[CSV] Parsed ${records.length} rows. Detected Headers:`, Object.keys(records[0]))

  let insertedCount = 0
  let errors: string[] = []

  for (const [index, row] of records.entries()) {
    try {
      // 3. Mapping (Robust)
      const qText = row.question || row.text || row.question_text || row.q
      const qDesc = row.description || row.direction || row.passage || row.instructions
      const qExp = row.explanation || row.rationale || row.solution || row.exp
      
      const optA = row.option_a || row.a || row.opt_a
      const optB = row.option_b || row.b || row.opt_b
      const optC = row.option_c || row.c || row.opt_c
      const optD = row.option_d || row.d || row.opt_d
      
      const correctVal = row.correct_option || row.answer || row.correct || row.ans

      if (!qText || !optA || !optB || !correctVal) {
        // Skip rows with missing critical data
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

  console.log(`[CSV] Complete. Success: ${insertedCount}`)

  if (insertedCount === 0) {
    throw new Error(`Failed to insert questions. Errors: ${errors.slice(0, 3).join(', ')}`)
  }
  
  return { success: true, inserted: insertedCount }
}

export async function uploadQuestionBankAction(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject_id = formData.get('subject_id') as string
  const csvFile = formData.get('csv_file') as File

  if (!csvFile || csvFile.size === 0) throw new Error('No file uploaded')

  // Create Bank
  const { data: bank, error } = await supabase
    .from('question_banks')
    .insert({ 
      title, 
      description, 
      subject_id 
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create bank: ${error.message}`)

  try {
    await parseAndInsertQuestions(csvFile, bank.id)
  } catch (error: any) {
    console.error("CSV Processing Failed:", error)
    await supabase.from('question_banks').delete().eq('id', bank.id)
    throw new Error(error.message || "CSV Upload Failed")
  }

  revalidatePath(`/dashboard/admin/subjects/${subject_id}/edit`)
}