import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react'

export default async function CategoryExamsPage({ 
  params 
}: { 
  params: Promise<{ categoryId: string }> 
}) {
  const supabase = await createClient()
  const { categoryId } = await params

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
  // Only auto-redirect for "CUET" because it's a specific exam, not a stream.
  // For Engineering/Medical, we ALWAYS show the list, so users can see "JEE Main", "JEE Advanced", etc.
  if (category.title.trim().toUpperCase() === 'CUET' && exams && exams.length > 0) {
    redirect(`/courses/${exams[0].id}`)
  }

  // --- LIST VIEW ---
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 h-20 flex items-center gap-4 border-b border-gray-100">
        <Link href="/categories" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Streams
        </Link>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-12">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2 block">
            {category.title}
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
            exams.map((exam) => (
              <Link 
                key={exam.id}
                href={`/courses/${exam.id}`} 
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
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}