import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Lock } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import SubjectContent from '@/components/Courses/SubjectContent'

export default async function SubjectDetailsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ courseId: string; subjectId: string }> 
  searchParams: Promise<{ from?: string }>
}) {
  const supabase = await createClient()
  
  // 1. Resolve Params & Authenticate User
  const { courseId, subjectId } = await params
  const { from } = await searchParams

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // 2. Fetch Subject & Course Info
  const { data: subject } = await supabase
    .from('subjects')
    .select(`
      title,
      course:courses(title)
    `)
    .eq('id', subjectId)
    .single()

  if (!subject) return notFound()

  // 3. CHECK ENROLLMENT STATUS
  const { data: enrollment } = await supabase
    .from('student_enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('subject_id', subjectId)
    .single()

  // 4. CHECK USER ROLE
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'school_admin'

  // 5. DETERMINE ACCESS LEVEL (FREEMIUM LOGIC)
  const hasFullAccess = !!enrollment || isAdmin

  // Handle Supabase Relation Array/Object weirdness for Course Title
  // @ts-ignore
  const courseData = subject.course as unknown as CourseRelation | CourseRelation[] | null
  const courseTitle = Array.isArray(courseData) 
    ? courseData[0]?.title 
    : courseData?.title

  // 6. Fetch Page Content (Fetching ALL content + Question Counts)
  const [modulesRes, practiceRes, mockRes] = await Promise.all([
    // A. Prep Modules
    supabase
      .from('prep_modules')
      .select('*, questions(count)')
      .eq('subject_id', subjectId)
      .eq('is_published', true)
      .order('created_at', { ascending: true }),
      
    // B. Practice Tests
    supabase
      .from('practice_tests')
      .select('*, questions(count)')
      .eq('subject_id', subjectId)
      .eq('is_published', true)
      .order('created_at', { ascending: true }),
      
    // C. Mock Tests
    supabase
      .from('exams')
      .select('*, questions(count)')
      .eq('subject_id', subjectId)
      .eq('category', 'mock')
      .eq('is_published', true)
      .order('created_at', { ascending: true })
  ])

  // Helper to extract count safely
  const formatData = (data: any[] | null) => {
    if (!data) return []
    return data.map((item) => ({
      ...item,
      // Supabase returns questions: [{ count: 5 }]
      question_count: item.questions?.[0]?.count || 0
    }))
  }

  const backLink = from === 'dashboard' 
    ? '/dashboard/my-courses' 
    : `/courses/${courseId}`
    
  const backLabel = from === 'dashboard'
    ? 'Back to Dashboard'
    : `Back to ${courseTitle || 'Course'}`

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Stub */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link 
            href={backLink} 
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Subject View</span>
            
            {!hasFullAccess && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                <Lock className="w-3 h-3" />
                Free Preview Mode
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            {subject.title}
          </h1>
        </div>

        <SubjectContent 
          modules={formatData(modulesRes.data)}
          practiceTests={formatData(practiceRes.data)}
          mockTests={formatData(mockRes.data)}
          courseId={courseId}
          subjectId={subjectId}
          hasFullAccess={hasFullAccess} 
        />
      </main>
    </div>
  )
}