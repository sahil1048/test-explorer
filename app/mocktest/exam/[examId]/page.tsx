import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
// Make sure your MockTestInterface is located here, or update the import path
import MockTestInterface from '@/components/mocktest/MockTestInterface'

export default async function MockExamPage({ 
  params 
}: { 
  params: Promise<{ examId: string }> 
}) {
  const { examId } = await params
  const supabase = await createClient()

  // 1. Authenticate User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Fetch Mock Test Details
  const { data: mockTest } = await supabase
    .from('mock_tests')
    .select('*')
    .eq('id', examId)
    .single()

  if (!mockTest) return notFound()

  // 3. Fetch Questions linked to this Mock Test
  // We join 'mock_test_questions' with 'questions' to get the actual data
  const { data: linkedQuestions } = await supabase
    .from('mock_test_questions')
    .select(`
      question:questions (
        id,
        question_text,
        options,
        marks
      )
    `)
    .eq('mock_test_id', examId)

  // Extract the actual question objects from the join result
  const questions = linkedQuestions?.flatMap((item: any) => item.question || []) || []

  // 4. Get or Create Attempt (Session)
  // Check if there is an active attempt for this user and mock test
  let { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('mock_test_id', examId) // Ensure your attempt table has this column
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  // If no active attempt, create a new one
  if (!attempt) {
    const { data: newAttempt, error } = await supabase
      .from('exam_attempts')
      .insert({
        user_id: user.id,
        mock_test_id: examId, // Linking to the mock_test table
        status: 'in_progress',
        total_marks: mockTest.total_marks || 0,
        duration_minutes: mockTest.duration_minutes || 0,
        answers: {},
        started_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) {
      console.error("Failed to start test session:", error)
      throw new Error("Could not start test session.")
    }
    attempt = newAttempt
  }

  // 5. Render the Interface
  return (
    <MockTestInterface 
      mockTest={mockTest}
      questions={questions}
      courseId={mockTest.course_id} // Used for redirection after submit
      examId={examId}
      subjectId="full-mock"
      user={user}
      attempt={attempt}
    />
  )
}