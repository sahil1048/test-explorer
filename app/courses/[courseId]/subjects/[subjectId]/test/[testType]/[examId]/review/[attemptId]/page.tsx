import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReviewInterface from '@/components/Courses/ReviewInterface'

export default async function ReviewPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ courseId: string; subjectId: string; testType: string; examId: string; attemptId: string }> 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { courseId, subjectId, testType, examId, attemptId } = await params
  const { returnTo } = await searchParams

  // 1. Fetch Attempt (User Answers)
  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('answers')
    .eq('id', attemptId)
    .single()

  if (!attempt) return notFound()

  // 2. Fetch Exam Title
  let examTitle = 'Unknown Test'
  if (testType === 'practice') {
    const { data } = await supabase.from('practice_tests').select('title').eq('id', examId).single()
    if (data) examTitle = data.title
  } else {
    const { data } = await supabase.from('exams').select('title').eq('id', examId).single()
    if (data) examTitle = data.title
  }

  // 3. Fetch Questions with Explanations & Correct Options
  // Note: We check against the correct FK based on testType
  let query = supabase
    .from('questions')
    .select(`
      id, 
      text, 
      explanation,
      options:question_options(id, text, is_correct)
    `)
    .order('order_index')

  if (testType === 'practice') {
    query = query.eq('practice_test_id', examId)
  } else {
    query = query.eq('exam_id', examId)
  }

  const { data: questions } = await query

  if (!questions) return <div>Failed to load questions.</div>

  // Link to go back to (Result Page)
  const defaultBack = `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${attemptId}`
  const backLink = returnTo ? decodeURIComponent(returnTo as string) : defaultBack

  return (
    <ReviewInterface 
      examTitle={examTitle}
      questions={questions}
      userAnswers={attempt.answers || {}} // Ensure defaults if null
      backLink={backLink}
    />
  )
}