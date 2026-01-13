'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { parse } from 'csv-parse/sync'

interface RankCSVRow {
  min_score: string;
  max_score: string;
  rank: string;
  percentile: string;
  [key: string]: string | undefined;
}

export async function uploadRankDataAction(formData: FormData) {
  const supabase = await createClient()

  // CHANGED: Now accepting course_id
  const course_id = formData.get('course_id') as string
  const file = formData.get('csv_file') as File

  if (!course_id) return { error: "Course ID is missing" }
  if (!file) return { error: "No file uploaded" }

  // 1. Parse CSV
  const fileContent = await file.text()
  const records = parse(fileContent, {
    columns: (headers: string[]) => 
      headers.map(h => 
        h.trim().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
      ),
    skip_empty_lines: true,
    trim: true, 
    relax_quotes: true
  }) as RankCSVRow[]

  if (records.length === 0) return { error: "CSV file is empty" }

  // 2. Prepare Data
  const rowsToInsert = records.map(row => {
    const min = row.min_score || row.min || row.score_from
    const max = row.max_score || row.max || row.score_to
    const rank = row.rank || row.approx_rank || row.rank_range
    const percentile = row.percentile || row.approx_percentile || row.percentile_range

    if (!min || !max) return null 

    return {
      course_id, // Link to Course
      min_score: parseFloat(min),
      max_score: parseFloat(max),
      approx_rank: rank,
      approx_percentile: percentile
    }
  }).filter(r => r !== null)

  if (rowsToInsert.length === 0) return { error: "No valid rows found. Check CSV headers." }

  // 3. TRANSACTION: Delete Old -> Insert New
  
  // A. Delete existing rank data for this COURSE
  const { error: deleteError } = await supabase
    .from('exam_rank_predictions')
    .delete()
    .eq('course_id', course_id)

  if (deleteError) return { error: "Failed to clear old data: " + deleteError.message }

  // B. Insert new data
  const { error: insertError } = await supabase
    .from('exam_rank_predictions')
    .insert(rowsToInsert)

  if (insertError) return { error: "Failed to save rank data: " + insertError.message }

  revalidatePath('/dashboard/admin/rank-prediction')
  return { success: true, count: rowsToInsert.length }
}

export async function deleteRankDataAction(courseId: string) {
  const supabase = await createClient()
  
  // Delete by course_id
  const { error } = await supabase
    .from('exam_rank_predictions')
    .delete()
    .eq('course_id', courseId)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/admin/rank-prediction')
  return { success: true }
}