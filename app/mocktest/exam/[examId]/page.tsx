import MockTestInterface from '@/app/courses/[courseId]/subjects/[subjectId]/test/mock/[examId]/MockTestInterface'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
// FIX 1: Ensure this imports from the correct components folder

export default async function MockExamPage({ 
  params 
}: { 
  params: Promise<{ examId: string }> 
}) {
  const { examId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. FETCH USER PROFILE (For Role Check & Mock Interface)
  // Using user.id directly as it's standard for Supabase relations
  const { data: userData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userData) return notFound()
    

  // 2. Fetch Mock Test Details
  const { data: mockTest, error: mockError } = await supabase
    .from('mock_tests')
    .select('*')
    .eq('id', examId)
    .single()

  if (mockError || !mockTest) {
    console.error("Mock Test fetch error:", mockError)
    return notFound()
  }

  // 3. Fetch Questions linked to this Mock Test
  const { data: questionsData, error: qError } = await supabase
    .from('questions')
    .select(`
      id,
      text, 
      explanation,
      options:question_options (*),
      mock_test_questions!inner(mock_test_id)
    `)
    .eq('mock_test_questions.mock_test_id', examId)

  if (qError) {
    console.error("Questions fetch error:", qError)
  }

  // 4. Transform Data (FIXED TYPE ERROR HERE)
  const questions = questionsData?.map((q: any) => ({
    id: q.id,
    // FIX 2: Map DB column 'text' to BOTH 'text' and 'question_text'
    // This satisfies the TypeScript error requiring 'text'
    text: q.text, 
    question_text: q.text, 
    options: q.options,
    marks: 4 // Default marks
  })) || []

  // 5. Get or Create Attempt (Session)
  let { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('mock_test_id', examId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (!attempt) {
    const { data: newAttempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: user.id,
        mock_test_id: examId,
        status: 'in_progress',
        total_marks: mockTest.total_marks || 0,
        duration_minutes: mockTest.duration_minutes || 0,
        answers: {},
        started_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (attemptError) {
      console.error("Attempt creation failed:", attemptError)
      return redirect('/dashboard?error=Failed to start test session')
    }
    attempt = newAttempt
  }
  
  return (
    <MockTestInterface 
      exam={mockTest} 
      questions={questions} 
      courseId={mockTest.course_id} 
      subjectId="full-mock" 
      examId={examId} 
      user={userData} 
    />
  )
}