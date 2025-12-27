import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import CourseTabs from '@/components/Courses/CourseTabs'

export default async function CourseSubjectsPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const supabase = await createClient()
  const { courseId } = await params

  // 1. Fetch Course Details
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (!course) return notFound()

  // 2. Fetch Subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*, question_banks(count)')
    .eq('course_id', courseId)
    .order('title')

  // 3. Fetch Mock Tests from 'mock_test' table
  // We use an alias 'questions:mock_test_questions' to match the 'mock.questions' expectation in your UI
  const { data: mocks } = await supabase
    .from('mock_tests')
    .select('*, mock_test_questions(count)') 
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })


  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Stub */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            Course Overview
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-4 leading-[0.9]">
            {course.title}
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl">
            {course.description || "Select a subject to dive deep, or take a full-length mock test."}
          </p>
        </div>

        {/* Client Tabs Component */}
        <CourseTabs 
          courseId={courseId}
          subjects={subjects || []}
          mocks={mocks || []}
        />

      </main>
    </div>
  )
}