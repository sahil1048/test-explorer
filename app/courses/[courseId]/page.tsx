import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BookOpen, Clock, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'

// A slightly softer, complimentary palette for subjects
const SUBJECT_COLORS = [
  'bg-[#E0F7FA] border-[#006064]', // Cyan-ish
  'bg-[#F3E5F5] border-[#4A148C]', // Purple-ish
  'bg-[#FFF3E0] border-[#E65100]', // Orange-ish
  'bg-[#E8F5E9] border-[#1B5E20]', // Green-ish
  'bg-[#FFEBEE] border-[#B71C1C]', // Red-ish
]

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

  // 2. Fetch Subjects for this Course
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .eq('course_id', courseId)
    .order('title')

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Stub (Keep consistent with layout) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link 
            href="/courses" 
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        
        {/* --- Header Section --- */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            Selected Course
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-4 leading-[0.9]">
            {course.title}
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl">
            {course.description || "Dive deep into specific subjects. Select one to find chapter-wise tests and mocks."}
          </p>
        </div>

        {/* --- Subjects List --- */}
        <div className="grid gap-6">
          {(!subjects || subjects.length === 0) ? (
            <div className="p-12 text-center border-3 border-dashed border-gray-200 rounded-4xl bg-gray-50">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No subjects have been added to this course yet.</p>
            </div>
          ) : (
            subjects.map((subject, index) => {
              // Cycle colors
              const style = SUBJECT_COLORS[index % SUBJECT_COLORS.length]
              const [bgColor, borderColor] = style.split(' ')

              return (
                <Link 
                  key={subject.id} 
                  // Future Route: /courses/[courseId]/subjects/[subjectId]
                  href={`/courses/${courseId}/subjects/${subject.id}`}
                  className="group block relative"
                >
                  <div className={`
                    relative z-10 flex flex-col md:flex-row md:items-center justify-between 
                    p-6 md:p-8 rounded-4xl border-2 border-black bg-white
                    transition-all duration-300 ease-out
                    group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  `}>
                    
                    {/* Left: Icon & Title */}
                    <div className="flex items-center gap-6">
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center border-2 
                        ${bgColor} ${borderColor} text-black font-black text-xl shadow-sm
                        group-hover:scale-110 transition-transform duration-300
                      `}>
                        {subject.title.substring(0, 2).toUpperCase()}
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {subject.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            Subject Module
                          </span>
                          {/* Placeholder for future data like '12 Chapters' */}
                          <span className="hidden md:flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Self-Paced
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Icon */}
                    <div className="mt-6 md:mt-0 flex items-center justify-end">
                      <div className="w-12 h-12 rounded-full border-2 border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-colors">
                        <ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}