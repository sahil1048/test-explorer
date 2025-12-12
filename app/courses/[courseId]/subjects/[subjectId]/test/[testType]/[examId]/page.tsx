import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TestInterface from '@/components/Courses/TestInterface' 
import { submitExamAction } from './actions' // Import action here
import MockTestInterface from '../../mock/[examId]/MockTestInterface'

export default async function TestPage({ 
  params 
}: { 
  params: Promise<{ courseId: string; subjectId: string; testType: string; examId: string }> 
}) {
  const supabase = await createClient()
  const { courseId, subjectId, testType, examId } = await params

  // ... (Exam Data Fetching Logic - Same as before) ...
  // [Copy the logic from your previous TestPage file here]
  // For brevity, assuming examData and questionsData are fetched correctly.
  
  // Re-fetch logic for context:
  let examData = null
  let questionsData = null
  
  if (testType === 'practice') {
     const { data } = await supabase.from('practice_tests').select('*').eq('id', examId).single()
     examData = data
     if(data) {
        const { data: q } = await supabase.from('questions').select('id, text, options:question_options(id, text)').eq('practice_test_id', examId).order('order_index')
        questionsData = q
     }
  } else {
     // MOCK
     const { data } = await supabase.from('exams').select('*').eq('id', examId).single()
     examData = data
     if(data) {
        const { data: q } = await supabase.from('questions').select('id, text, options:question_options(id, text)').eq('exam_id', examId).order('order_index')
        questionsData = q
     }
  }

  if (!examData) return notFound()

    if (testType === 'mock') {
    return (
      <MockTestInterface 
         exam={examData} 
         questions={questionsData || []} 
         courseId={courseId}
         subjectId={subjectId}
         examId={examId}
      />
    )
  }

  // --- BIND THE ACTION ---
  // We create a specific function for this page render that already knows the IDs
  const bindedSubmitAction = async (answers: Record<string, string>, timeTaken: number) => {
    'use server'
    // Ensure we return the result from the inner function
    return await submitExamAction(examId, courseId, subjectId, answers, timeTaken, testType)
  }

  return (
    <TestInterface 
      exam={examData} 
      questions={questionsData || []} 
      courseId={courseId}
      subjectId={subjectId}
      testType={testType}
      submitAction={bindedSubmitAction} // Pass the bound action
    />
  )
}