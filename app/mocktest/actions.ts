'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitMockTestAction(
  examId: string,
  attemptId: string,
  answers: Record<string, string>,
  timeTaken: number
) {
  const supabase = await createClient()

  // 1. Fetch Dynamic Marking Scheme from mock_tests table
  const { data: mockData, error: mockError } = await supabase
    .from('mock_tests')
    .select('marks_correct, marks_incorrect')
    .eq('id', examId)
    .single()

  if (mockError || !mockData) {
    console.error("Error fetching mock settings:", mockError)
    return { error: "Failed to load exam settings" }
  }

  // Use DB values or fallback to default (+4, -1)
  const MARKS_CORRECT = mockData.marks_correct ?? 4
  const MARKS_INCORRECT = mockData.marks_incorrect ?? -1

  // 2. Fetch Correct Answers from DB
  // Note: Ensure this query matches your schema. For mocks, it often requires joining 'mock_test_questions'
  const { data: questions } = await supabase
    .from('questions')
    .select('id, options:question_options(id, is_correct)')
    .eq('exam_id', examId) 

  if (!questions) return { error: "Exam questions not found" }

  // 3. Calculate Score
  let correct = 0
  let incorrect = 0
  let score = 0

  questions.forEach(q => {
    const userAnswerId = answers[q.id]
    if (userAnswerId) {
      // @ts-ignore
      const correctOption = q.options.find(o => o.is_correct)
      
      if (correctOption && correctOption.id === userAnswerId) {
        correct++
        score += Number(MARKS_CORRECT) // Add positive marks
      } else {
        incorrect++
        score += Number(MARKS_INCORRECT) // Add negative marks (e.g., score += -1)
      }
    }
  })

  // 4. Update Attempt Record
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

  if (error) return { error: error.message }

  return {
    success: true,
    score,
    totalMarks: questions.length * Number(MARKS_CORRECT),
    correct,
    incorrect
  }
}