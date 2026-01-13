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
  } else if (testType === 'mock') {
    const { data } = await supabase.from('mock_tests').select('title').eq('id', examId).single()
    if (data) examTitle = data.title
  } else {
    const { data } = await supabase.from('exams').select('title').eq('id', examId).single()
    if (data) examTitle = data.title
  }

  // 3. Fetch Questions
  const questionSelect = `
    id, 
    text, 
    explanation,
    options:question_options(id, text, is_correct)
  `

  // Use 'any[]' here to avoid TypeScript conflicts during the data gathering phase
  let questions: any[] = []

  if (testType === 'mock') {
    // MOCK TESTS: Fetch via the join table
    const { data: mockData } = await supabase
      .from('mock_test_questions')
      .select(`question:questions(${questionSelect})`)
      .eq('mock_test_id', examId)
    
    // FIX: Handle if 'question' is returned as an array or object
    questions = mockData?.map((item: any) => {
      const q = item.question
      // If it's an array (Supabase one-to-many inference), take the first item
      return Array.isArray(q) ? q[0] : q
    }).filter((q) => q !== null) || []
    
  } else {
    // PRACTICE & STANDARD EXAMS: Direct fetch
    let query = supabase
      .from('questions')
      .select(questionSelect)
      .order('order_index')

    if (testType === 'practice') {
      query = query.eq('practice_test_id', examId)
    } else {
      query = query.eq('exam_id', examId)
    }

    const { data } = await query
    questions = data || []
  }

  if (!questions) return <div>Failed to load questions.</div>

  // Link to go back to (Result Page)
  const defaultBack = `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${attemptId}`
  const backLink = returnTo ? decodeURIComponent(returnTo as string) : defaultBack

  return (
    <ReviewInterface 
      examTitle={examTitle}
      questions={questions}
      userAnswers={attempt.answers || {}} 
      backLink={backLink}
    />
  )
}