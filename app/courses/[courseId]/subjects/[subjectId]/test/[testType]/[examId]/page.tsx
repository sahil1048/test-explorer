import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
// Ensure this path matches where you keep your component. 
// If it is in the same folder as page.tsx, use './mock-interface'
import MockTestInterface from '../../mock/[examId]/MockTestInterface' 
import TestInterface from '@/components/Courses/TestInterface' 
import { submitExamAction } from './actions' 

export default async function TestPage({ 
  params 
}: { 
  params: Promise<{ courseId: string; subjectId: string; testType: string; examId: string }> 
}) {
  const supabase = await createClient()
  const { courseId, subjectId, testType, examId } = await params

  // 1. FETCH USER (REQUIRED for the Sidebar in Mock Interface)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.identities?.map((id: any) => id.user_id)[0]) // Adjusted to get the correct user ID
    .single()

  if (profileError || !userData) {
    console.error("Error fetching user profile:", profileError)
    // Fallback: If profile missing, use auth data (though profile should exist)
    // You might want to handle this differently (e.g., redirect to profile creation)
  }
  
  if (!user) {
    return redirect('/login')
  }

  // 2. FETCH EXAM DATA
  let examData = null
  let questionsData = null
  
  if (testType === 'practice') {
     const { data } = await supabase.from('practice_tests').select('*').eq('id', examId).single()
     examData = data
     if(data) {
        const { data: q } = await supabase
          .from('questions')
          .select('id, text, options:question_options(id, text), direction')
          .eq('practice_test_id', examId)
          .order('order_index')
        questionsData = q
     }
  } else {
     // MOCK
     const { data } = await supabase.from('exams').select('*').eq('id', examId).single()
     examData = data
     if(data) {
        const { data: q } = await supabase
          .from('questions')
          .select('id, text, options:question_options(id, text), direction')
          .eq('exam_id', examId)
          .order('order_index')
        questionsData = q
     }
  }

  if (!examData) return notFound()

  // 3. RENDER MOCK INTERFACE
  if (testType === 'mock') {
    return (
      <MockTestInterface 
         exam={examData} 
         questions={questionsData || []} 
         courseId={courseId}
         subjectId={subjectId}
         examId={examId}
         user={userData} // <--- FIXED: Passed the user prop
      />
    )
  }

  // 4. RENDER STANDARD PRACTICE INTERFACE
  const bindedSubmitAction = async (answers: Record<string, string>, timeTaken: number) => {
    'use server'
    return await submitExamAction(examId, courseId, subjectId, answers, timeTaken, testType)
  }

  return (
    <TestInterface 
      exam={examData} 
      questions={questionsData || []} 
      courseId={courseId}
      subjectId={subjectId}
      testType={testType}
      submitAction={bindedSubmitAction}
    />
  )
}