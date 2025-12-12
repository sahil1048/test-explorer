import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Trophy, PlayCircle, Calendar, BarChart2, ListTodo } from 'lucide-react'

export default async function MyExamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div>Please login.</div>

  // Fetch all attempts with full hierarchy to build links
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select(`
      *,
      exams (
        id,
        title,
        subject_id,
        subjects (
          id,
          course_id
        )
      ),
      practice_tests (
        id,
        title,
        subject_id,
        subjects (
          id,
          course_id
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">My Exam History</h1>
        <p className="text-gray-500">A complete record of your mock and practice tests.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
        {(!attempts || attempts.length === 0) ? (
          <div className="p-12 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <FileText className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">No Exams Found</h3>
             <p className="text-gray-500 mb-6">Start practicing to see your history here.</p>
             <Link href="/categories" className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors">
               Browse Tests
             </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {attempts.map((attempt) => {
              // Determine Type & Data
              const isMock = !!attempt.exam_id
              const testData = isMock ? attempt.exams : attempt.practice_tests
              
              // Safeguard if test was deleted
              if (!testData) return null

              const title = testData.title
              // @ts-ignore - Supabase types join
              const subjectId = testData.subject_id
              // @ts-ignore
              const courseId = testData.subjects?.course_id
              
              const type = isMock ? 'mock' : 'practice'
              const examId = isMock ? attempt.exam_id : attempt.practice_test_id

              // Construct Links
              const returnPath = encodeURIComponent('/dashboard/exams')
              const resultLink = `/courses/${courseId}/subjects/${subjectId}/test/${type}/${examId}/result/${attempt.id}?returnTo=${returnPath}`
              const reviewLink = `/courses/${courseId}/subjects/${subjectId}/test/${type}/${examId}/review/${attempt.id}?returnTo=${returnPath}`

              const date = new Date(attempt.created_at).toLocaleDateString('en-US', { 
                weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
              })
              const time = new Date(attempt.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

              return (
                <div key={attempt.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50 transition-colors">
                   
                   <div className="flex items-start gap-4 flex-1">
                      <div className={`mt-1 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isMock ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                         {isMock ? <Trophy className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1 font-medium">
                           <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide ${isMock ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'}`}>
                             {isMock ? 'Mock' : 'Practice'}
                           </span>
                           <span className="flex items-center gap-1">
                             <Calendar className="w-3.5 h-3.5" /> {date} <span className="text-gray-300">|</span> {time}
                           </span>
                        </div>
                      </div>
                   </div>

                   <div className="flex flex-wrap items-center gap-4 md:gap-8 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                      {/* Score Stats */}
                      <div className="flex gap-6 mr-4">
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score</div>
                          <div className="text-lg font-black text-gray-900">{attempt.score} <span className="text-sm text-gray-400 font-medium">/ {attempt.total_marks}</span></div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Accuracy</div>
                          <div className={`text-lg font-black ${attempt.percentage >= 70 ? 'text-green-600' : attempt.percentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {attempt.percentage}%
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Link 
                          href={resultLink}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:text-black hover:border-black transition-all flex items-center gap-2"
                        >
                          <BarChart2 className="w-4 h-4" /> Result
                        </Link>
                        <Link 
                          href={reviewLink}
                          className="px-4 py-2 bg-black text-white border border-black rounded-lg text-sm font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
                        >
                          <ListTodo className="w-4 h-4" /> Review
                        </Link>
                      </div>
                   </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}