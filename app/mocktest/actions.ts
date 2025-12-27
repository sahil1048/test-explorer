'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitMockTestAction(
  examId: string,
  attemptId: string,
  answers: Record<string, string>,
  timeTaken: number
) {
  const supabase = await createClient()

  // 1. Fetch Correct Answers from DB
  const { data: questions } = await supabase
    .from('questions')
    .select('id, options:question_options(id, is_correct)')
    .eq('exam_id', examId)

  if (!questions) throw new Error("Exam questions not found")

  // 2. Calculate Score
  let correct = 0
  let incorrect = 0
  let score = 0
  
  // Scoring: +4 Correct, -1 Incorrect
  const MARKS_PER_CORRECT = 4
  const MARKS_PER_WRONG = 1

  questions.forEach(q => {
    const userAnswerId = answers[q.id]
    if (userAnswerId) {
      // @ts-ignore
      const correctOption = q.options.find(o => o.is_correct)
      if (correctOption && correctOption.id === userAnswerId) {
        correct++
        score += MARKS_PER_CORRECT
      } else {
        incorrect++
        score -= MARKS_PER_WRONG
      }
    }
  })

  // 3. Update Attempt Record
  const { error } = await supabase
    .from('exam_attempts')
    .update({
      status: 'completed',
      score: score,
      answers: answers,
      time_taken_seconds: timeTaken,
      completed_at: new Date().toISOString()
    })
    .eq('id', attemptId)

  if (error) throw new Error(error.message)

  return {
    success: true,
    score,
    totalMarks: questions.length * MARKS_PER_CORRECT,
    correct,
    incorrect
  }
}