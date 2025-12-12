import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowUpRight, BarChart } from 'lucide-react'
import UserNav from '@/components/Navbar/UserNav' // Reuse your nav

// Gen Z Color Palette
const CARD_COLORS = [
  'bg-[#CEFF1A]', // Neon Lime
  'bg-[#E5D4FF]', // Soft Purple
  'bg-[#FFD4D4]', // Soft Red
  'bg-[#D4F5FF]', // Cyan
  'bg-[#FFC8DD]', // Pink
  'bg-[#FFF4C3]', // Yellow
]

export default async function CoursesPage() {
  const supabase = await createClient()
  
  // 1. Get User for Navbar
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // 2. Fetch Courses
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at')

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - Simplified for App Area */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight">
            Test Explorer
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-black">
              My Stats
            </Link>
            <UserNav profile={profile} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6">
            Pick Your <span className="text-blue-600">Battle</span>.
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            Explore our comprehensive course library tailored for your success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses?.map((course, index) => {
            const cardColor = CARD_COLORS[index % CARD_COLORS.length]
            return (
              <Link 
                href={`/courses/${course.id}`} 
                key={course.id}
                className="group relative block"
              >
                <div className={`
                  relative z-10 h-full p-8 rounded-[2.5rem] border-2 border-black 
                  transition-all duration-300 ease-out
                  group-hover:-translate-y-2 group-hover:translate-x-1 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                  ${cardColor}
                `}>
                  <div className="flex justify-between items-start mb-12">
                    <div className="bg-black/5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-black/70">
                      COURSE
                    </div>
                    <div className="bg-white rounded-full p-3 border-2 border-black transition-transform group-hover:rotate-45">
                      <ArrowUpRight className="w-6 h-6 text-black" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-black text-black mb-3 tracking-tight leading-none">
                      {course.title}
                    </h3>
                    <p className="text-black/80 font-medium text-sm leading-relaxed line-clamp-2">
                      {course.description || 'Start your preparation journey.'}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}