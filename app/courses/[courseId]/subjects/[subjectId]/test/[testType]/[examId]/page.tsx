import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TestInterface from '@/components/Courses/TestInterface' // Update path if you moved this

export default async function TestPage({ 
  params 
}: { 
  params: Promise<{ courseId: string; subjectId: string; testType: string; examId: string }> 
}) {
  const supabase = await createClient()
  const { courseId, subjectId, testType, examId } = await params

  console.log("--- TEST PAGE DEBUG ---")
  console.log("Type:", testType)
  console.log("ID:", examId)

  let examData = null
  let questionsData = null

  // 1. Fetch Exam Data based on Type
  if (testType === 'practice') {
    // Fetch from 'practice_tests' table
    const { data, error } = await supabase
      .from('practice_tests')
      .select('*')
      .eq('id', examId)
      .single()
      
    if (error) console.error("Practice Fetch Error:", error.message)
    examData = data

    if (examData) {
       // Fetch questions linked to practice_test_id
       const { data: q } = await supabase
         .from('questions')
         .select('id, text, options:question_options(id, text)')
         .eq('practice_test_id', examId)
         .order('order_index')
       questionsData = q
    }

  } else if (testType === 'mock') {
    // Fetch from 'exams' table
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single()

    if (error) console.error("Mock Fetch Error:", error.message)
    examData = data

    if (examData) {
       // Fetch questions linked to exam_id
       const { data: q } = await supabase
         .from('questions')
         .select('id, text, options:question_options(id, text)')
         .eq('exam_id', examId)
         .order('order_index')
       questionsData = q
    }
  }

  // 2. If no exam found, show 404
  if (!examData) {
    console.error("❌ Exam Data Not Found in DB")
    return notFound()
  }

  console.log("✅ Exam Found:", examData.title)
  console.log("❓ Questions Found:", questionsData?.length || 0)

  return (
    <TestInterface 
      exam={examData} 
      questions={questionsData || []} 
      courseId={courseId}
      subjectId={subjectId}
      testType={testType}
    />
  )
}