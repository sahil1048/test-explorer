'use server'

import { createClient } from '@/lib/supabase/server'
// REMOVE: import { redirect } from 'next/navigation' 

export async function submitExamAction(
  examId: string, 
  courseId: string,
  subjectId: string,
  answers: Record<string, string>, 
  timeTaken: number,
  testType: string
) {
  const supabase = await createClient()
  
  // 1. Check User Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 2. Fetch Questions
  let query = supabase
    .from('questions')
    .select('id, options:question_options(id, is_correct)')

  if (testType === 'practice') {
    query = query.eq('practice_test_id', examId)
  } else {
    query = query.eq('exam_id', examId)
  }

  const { data: questions, error: fetchError } = await query

  if (fetchError || !questions) {
    console.error('Error fetching questions:', fetchError)
    throw new Error('Failed to load exam data for grading.')
  }

  // 3. Calculate Score & Counts
  let correctCount = 0
  let incorrectCount = 0
  const totalQuestions = questions.length

  questions.forEach(q => {
    // @ts-ignore
    const correctOption = q.options.find((o: any) => o.is_correct)
    const userSelectedOptionId = answers[q.id]
    
    // Check if user attempted the question
    if (userSelectedOptionId) {
      if (correctOption && userSelectedOptionId === correctOption.id) {
        correctCount += 1
      } else {
        incorrectCount += 1
      }
    }
  })

  // Basic scoring: 1 mark per question (Update logic here if you implement negative marking)
  const score = correctCount 

  // 4. Save Attempt
  const attemptPayload = {
    user_id: user.id,
    score: score,
    total_marks: totalQuestions,
    percentage: totalQuestions > 0 ? (score / totalQuestions) * 100 : 0,
    time_taken_seconds: timeTaken,
    answers: answers,
    exam_id: testType === 'mock' ? examId : null, 
    practice_test_id: testType === 'practice' ? examId : null 
  }
  
  const { data: attempt, error: saveError } = await supabase
    .from('exam_attempts')
    .insert(attemptPayload)
    .select()
    .single()

  if (saveError) {
    console.error('Submission Error:', saveError)
    throw new Error('Failed to save attempt')
  }

  // 5. RETURN Data with Stats
  return { 
    success: true, 
    redirectUrl: `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${attempt.id}`,
    score: score,
    correct: correctCount,
    incorrect: incorrectCount
  }
}