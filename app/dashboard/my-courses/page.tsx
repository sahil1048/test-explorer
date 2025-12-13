import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ChevronRight, GraduationCap, Lock } from 'lucide-react'

// ... (Helper Types remain the same) ...
interface EnrolledSubject {
  id: string
  title: string
  courses: {
    id: string
    title: string
  }
}

export default async function MyCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // ... (Data Fetching Logic remains the same) ...
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select(`
      subject_id,
      subjects (
        id,
        title,
        courses (
          id,
          title
        )
      )
    `)
    .eq('user_id', user.id)

  const groupedCourses: Record<string, { id: string, subjects: any[] }> = {}

  if (enrollments) {
    enrollments.forEach((item: any) => {
      const subject = item.subjects
      const course = Array.isArray(subject.courses) ? subject.courses[0] : subject.courses
      
      if (!course) return

      if (!groupedCourses[course.title]) {
        groupedCourses[course.title] = {
          id: course.id,
          subjects: []
        }
      }
      groupedCourses[course.title].subjects.push(subject)
    })
  }

  const courseKeys = Object.keys(groupedCourses)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
           <GraduationCap className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Courses</h1>
          <p className="text-gray-500 font-medium">Access all your enrolled subjects and learning material.</p>
        </div>
      </div>

      {courseKeys.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed">
          {/* ... (Empty State UI remains the same) ... */}
           <Link 
            href="/categories" 
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
          >
            <BookOpen className="w-4 h-4" /> Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {courseKeys.map((courseTitle) => {
            const courseData = groupedCourses[courseTitle]
            
            return (
              <div key={courseData.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
                   <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                     <span className="w-2 h-8 bg-blue-600 rounded-full block mr-2"></span>
                     {courseTitle}
                   </h2>
                   {/* Also add ?from=dashboard here if you want consistency */}
                   <Link 
                     href={`/courses/${courseData.id}?from=dashboard`}
                     className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                   >
                     View Course Info <ChevronRight className="w-4 h-4" />
                   </Link>
                </div>

                <div className="p-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Enrolled Subjects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courseData.subjects.map((subject) => (
                      <Link 
                        key={subject.id}
                        // --- UPDATE: Add query param ---
                        href={`/courses/${courseData.id}/subjects/${subject.id}?from=dashboard`}
                        className="group flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors font-bold text-sm">
                            {subject.title.substring(0,2).toUpperCase()}
                          </div>
                          <span className="font-bold text-gray-700 group-hover:text-gray-900">{subject.title}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 group-hover:border-blue-200 text-gray-300 group-hover:text-blue-500">
                           <ChevronRight className="w-5 h-5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}