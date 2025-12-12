import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { notFound } from 'next/navigation'
import SubjectContent from '@/components/Courses/SubjectContent'

export default async function SubjectDetailsPage({ 
  params 
}: { 
  params: Promise<{ courseId: string; subjectId: string }> 
}) {
  const supabase = await createClient()
  const { courseId, subjectId } = await params

  // 1. Fetch Subject & Course Info
  // We perform the join 'course:courses(title)' to get the parent course title
  const { data: subject } = await supabase
    .from('subjects')
    .select('title, course:courses(title)')
    .eq('id', subjectId)
    .single()

  if (!subject) return notFound()

  // FIX: Supabase might return 'course' as an array or an object depending on version/types.
  // We handle both cases here safely.
  // @ts-ignore - Suppress TS warning if types aren't perfectly generated
  const courseTitle = Array.isArray(subject.course) 
    ? subject.course[0]?.title 
    // @ts-ignore
    : subject.course?.title

  // 2. Fetch Data for Tabs (Parallel Requests)
  const [modulesRes, practiceRes, mockRes] = await Promise.all([
    // A. Prep Modules
    supabase.from('prep_modules').select('*').eq('subject_id', subjectId).eq('is_published', true),
    // B. Practice Tests
    supabase.from('exams').select('*').eq('subject_id', subjectId).eq('category', 'practice').eq('is_published', true),
    // C. Mock Tests
    supabase.from('exams').select('*').eq('subject_id', subjectId).eq('category', 'mock').eq('is_published', true)
  ])

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Stub */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link 
            href={`/courses/${courseId}`} 
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {courseTitle || 'Course'}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Subject View</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            {subject.title}
          </h1>
        </div>

        {/* Client Component for Tabs & Content */}
        <SubjectContent 
          modules={modulesRes.data || []}
          practiceTests={practiceRes.data || []}
          mockTests={mockRes.data || []}
        />
      </main>
    </div>
  )
}