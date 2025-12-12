import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { notFound } from 'next/navigation'
// Ensure this import path matches where you put your component
import QuizInterface from '@/components/Courses/QuizInterface' 

export default async function PrepModulePage({ 
  params 
}: { 
  params: Promise<{ courseId: string; subjectId: string; moduleId: string }> 
}) {
  const supabase = await createClient()
  const { courseId, subjectId, moduleId } = await params

  // 1. Fetch Module Details
  const { data: moduleData } = await supabase
    .from('prep_modules')
    .select('title, description')
    .eq('id', moduleId)
    .single()

  if (!moduleData) return notFound()

  // 2. Fetch Questions & Options
  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id, 
      text, 
      explanation, 
      options:question_options(id, text, is_correct)
    `)
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-6 h-20 flex flex-col justify-center">
          {/* Breadcrumb / Back Link */}
          <Link 
            href={`/courses/${courseId}/subjects/${subjectId}`} 
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest mb-1 transition-colors w-fit"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Subject
          </Link>
          <div className="flex items-center gap-3">
             <BookOpen className="w-5 h-5 text-orange-500" />
             <h1 className="text-xl font-black text-gray-900 truncate">
               {moduleData.title}
             </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12">
        {(!questions || questions.length === 0) ? (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
               <span className="text-4xl">😴</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Yet</h2>
            <p className="text-gray-500">This module is currently being updated. Check back later!</p>
          </div>
        ) : (
          <QuizInterface questions={questions} />
        )}
      </main>
    </div>
  )
}