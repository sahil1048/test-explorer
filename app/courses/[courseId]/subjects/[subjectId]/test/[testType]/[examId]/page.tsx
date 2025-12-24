import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import AccessDenied from '@/components/ui/access-denied'
// Ensure these paths match your project structure
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

  // 1. AUTHENTICATE USER
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. FETCH USER PROFILE (For Role Check & Mock Interface)
  // Using user.id directly as it's standard for Supabase relations
  const { data: userData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. CHECK ACCESS (Freemium Logic)
  // A. Check Enrollment
  const { data: enrollment } = await supabase
    .from('student_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subjectId)
    .single()

  // B. Check Admin Role
  const isAdmin = userData?.role === 'super_admin' || userData?.role === 'school_admin'
  const hasFullAccess = !!enrollment || isAdmin

  // 🔒 GATEKEEPING: If no full access, check if this test is in the "Free" tier (Top 2)
  if (!hasFullAccess) {
     let isAllowed = false

     if (testType === 'practice') {
        // Fetch top 2 practice tests (Free Tier)
        const { data: allowedTests } = await supabase
           .from('practice_tests')
           .select('id')
           .eq('subject_id', subjectId)
           .eq('is_published', true)
           .order('created_at', { ascending: false }) // Must match Subject Page sort order
           .limit(2)
        
        isAllowed = allowedTests?.some(t => t.id === examId) || false
     } 
     else if (testType === 'mock') {
        // Fetch top 2 mock tests (Free Tier)
        const { data: allowedTests } = await supabase
           .from('exams')
           .select('id')
           .eq('subject_id', subjectId)
           .eq('category', 'mock')
           .eq('is_published', true)
           .order('created_at', { ascending: false }) // Must match Subject Page sort order
           .limit(2)
           
        isAllowed = allowedTests?.some(t => t.id === examId) || false
     }

     if (!isAllowed) {
        return <AccessDenied subjectTitle="Restricted Test" />
     }
  }

  // 4. FETCH EXAM DATA
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

  // 5. RENDER MOCK INTERFACE
  if (testType === 'mock') {
    return (
      <MockTestInterface 
         exam={examData} 
         questions={questionsData || []} 
         courseId={courseId}
         subjectId={subjectId}
         examId={examId}
         user={userData} 
      />
    )
  }

  // 6. RENDER STANDARD PRACTICE INTERFACE
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