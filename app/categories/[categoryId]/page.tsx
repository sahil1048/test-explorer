import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react'

// Note: In Next.js 15, searchParams is a Promise
export default async function CategoryExamsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ categoryId: string }>,
  searchParams: Promise<{ mode?: string }>
}) {
  const supabase = await createClient()
  const { categoryId } = await params
  const { mode } = await searchParams

  // 1. Fetch Category Info
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (!category) return notFound()

  // 2. Fetch Exams (Courses) in this Category
  const { data: exams } = await supabase
    .from('courses')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_published', true)

  // --- SMART REDIRECT LOGIC ---
  // If Approach 1 (Direct) is active and it's CUET, auto-redirect
  if (mode !== 'landing' && category.title.trim().toUpperCase() === 'CUET' && exams && exams.length > 0) {
    redirect(`/courses/${exams[0].id}`)
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/categories" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Streams
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-12">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2 block">
            {category.title} {mode === 'landing' && "(Landing Page Flow)"}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Select an Exam
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(!exams || exams.length === 0) ? (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 font-medium">
              No exams found in this category yet.
            </div>
          ) : (
            exams.map((exam) => {
              // Toggle Link based on approach
              const targetHref = mode === 'landing' 
                ? `/exams/${exam.slug}`  // Approach 2: Informative Landing Page
                : `/courses/${exam.id}`; // Approach 1: Direct Content/Login

              return (
                <Link 
                  key={exam.id}
                  href={targetHref} 
                  className="group block relative"
                >
                  <div className="relative z-10 p-8 rounded-4xl border-2 border-black bg-white transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bg-blue-50 text-blue-700 p-3 rounded-xl">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-black transition-colors" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                    <p className="text-gray-500 font-medium text-sm line-clamp-2">{exam.description}</p>
                    
                    {mode === 'landing' && (
                      <span className="mt-4 inline-block text-xs font-bold text-blue-600 group-hover:underline">
                        View Exam Details →
                      </span>
                    )}
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