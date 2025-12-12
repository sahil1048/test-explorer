'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitExamAction(
  examId: string, 
  courseId: string,
  subjectId: string,
  answers: Record<string, string>, 
  timeTaken: number,
  testType: string // 'practice' or 'mock'
) {
  const supabase = await createClient()
  
  // 1. Check User Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 2. Fetch Correct Answers based on Test Type
  // We need to know which foreign key to check in the 'questions' table
  let query = supabase
    .from('questions')
    .select('id, options:question_options(id, is_correct)')

  if (testType === 'practice') {
    query = query.eq('practice_test_id', examId)
  } else {
    query = query.eq('exam_id', examId) // Default for 'mock'
  }

  const { data: questions, error: fetchError } = await query

  if (fetchError || !questions) {
    console.error('Error fetching questions:', fetchError)
    throw new Error('Failed to load exam data for grading.')
  }

  // 3. Calculate Score
  let score = 0
  let totalQuestions = questions.length

  questions.forEach(q => {
    // @ts-ignore - Supabase types join fix
    const correctOption = q.options.find((o: any) => o.is_correct)
    const userSelectedOptionId = answers[q.id]
    
    // Simple +1 marking scheme. Modify for +4/-1 if needed.
    if (correctOption && userSelectedOptionId === correctOption.id) {
      score += 1
    }
  })

  // 4. Save Attempt
  // We store the 'examId' (which could be a practice_id or exam_id) 
  // along with the answers.
  
  // Note: Ensure your 'exam_attempts' table has a 'type' or similar column 
  // if you want to distinguish later, or just store it in 'exam_id' generic column.
  // For strict FKs, you might need to insert into nullable columns:
  // exam_id: (testType === 'mock' ? examId : null)
  // practice_test_id: (testType === 'practice' ? examId : null)
  
  // Assuming a generic schema for simplicity or that you added columns:
  const attemptPayload = {
    user_id: user.id,
    score: score,
    total_marks: totalQuestions, // Assuming 1 mark per question
    percentage: totalQuestions > 0 ? (score / totalQuestions) * 100 : 0,
    time_taken_seconds: timeTaken,
    answers: answers,
    // If you haven't added 'practice_test_id' to exam_attempts table yet, 
    // you might need to just use 'exam_id' for both if constraints allow, 
    // or run a migration to add the column.
    exam_id: testType === 'mock' ? examId : null, 
    // practice_test_id: testType === 'practice' ? examId : null 
  }

  // If you only have 'exam_id' linked to 'exams' table, saving a practice ID there might fail FK constraint.
  // Ideally, add a 'practice_test_id' column to 'exam_attempts'.
  // For now, let's assume we try to insert. If it fails due to FK, you need the SQL update below.
  
  const { data: attempt, error: saveError } = await supabase
    .from('exam_attempts')
    .insert(attemptPayload)
    .select()
    .single()

  if (saveError) {
    console.error('Submission Error:', saveError)
    throw new Error('Failed to save attempt')
  }

  // 5. Redirect to Result Page
  redirect(`/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${attempt.id}`)
}