import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Trophy, 
  Clock, 
  Target, 
  BarChart2, 
  X,
  RotateCcw,
  ListTodo
} from 'lucide-react'

export default async function ResultPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ courseId: string; subjectId: string; testType: string; examId: string; attemptId: string }> 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { examId, attemptId, courseId, subjectId, testType } = await params
  const { returnTo } = await searchParams

  const closeLink = returnTo ? decodeURIComponent(returnTo as string) : `/courses/${courseId}/subjects/${subjectId}`

  // 1. Fetch Attempt Data
  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .single()

  if (!attempt) return <div>Result not found</div>

  // 2. Fetch Exam Title & Questions to calculate stats
  let examTitle = 'Test Result'
  let questions = []

  // Determine table based on testType
  const examTable = testType === 'practice' ? 'practice_tests' : 'exams'
  const questionFK = testType === 'practice' ? 'practice_test_id' : 'exam_id'

  // Fetch Exam Title
  const { data: examData } = await supabase
    .from(examTable)
    .select('title')
    .eq('id', examId)
    .single()
  
  if (examData) examTitle = examData.title

  // Fetch Questions (needed to know total count and correct answers for chart)
  const { data: questionData } = await supabase
    .from('questions')
    .select('id, options:question_options(id, is_correct)')
    .eq(questionFK, examId)
  
  questions = questionData || []

  // 3. Calculate Detailed Stats
  const totalQuestions = questions.length
  const userAnswers = attempt.answers || {}
  
  let correctCount = 0
  let incorrectCount = 0
  let skippedCount = 0

  questions.forEach((q: any) => {
    const selectedOptionId = userAnswers[q.id]
    const correctOption = q.options.find((o: any) => o.is_correct)

    if (!selectedOptionId) {
      skippedCount++
    } else if (correctOption && selectedOptionId === correctOption.id) {
      correctCount++
    } else {
      incorrectCount++
    }
  })

  // Calculate Percentages for Chart
  const correctPercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
  const incorrectPercent = totalQuestions > 0 ? (incorrectCount / totalQuestions) * 100 : 0
  const skippedPercent = totalQuestions > 0 ? (skippedCount / totalQuestions) * 100 : 0

  // Create Conic Gradient String
  // Green (Correct) -> Red (Incorrect) -> Yellow (Skipped)
  const chartGradient = `conic-gradient(
    #4CAF50 0% ${correctPercent}%, 
    #FF4D4D ${correctPercent}% ${correctPercent + incorrectPercent}%, 
    #FFB020 ${correctPercent + incorrectPercent}% 100%
  )`

  // Basic Stats
  const score = attempt.score || 0
  const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(1) : "0.0"
  const timeUsed = `${Math.floor(attempt.time_taken_seconds / 60)}m ${attempt.time_taken_seconds % 60}s`

  // Dummy Topper Data
  const topperScore = Math.min(totalQuestions, score + 2)
  const topperTime = timeUsed

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm fixed inset-0 z-50">
      <div className="bg-[#FFF8F0] w-full max-w-5xl h-[90vh] rounded-[2rem] overflow-y-auto relative shadow-2xl">
        
        {/* Close Button */}
        <Link 
          href={closeLink} 
          className="absolute top-6 right-6 p-2 bg-[#FF6B35] rounded-full text-white hover:bg-[#E85D2E] transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </Link>

        <div className="p-8 md:p-12">
          
          <div className="text-center mb-10">
            <span className="bg-[#FF6B35] text-white px-6 py-2 rounded-xl font-bold text-lg shadow-lg shadow-orange-200">
              {examTitle} Report
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Score" value={`${score}/${totalQuestions}`} icon={Target} color="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Percentile" value="Top 10%" icon={Trophy} color="text-orange-600" bg="bg-orange-50" />
            <StatCard label="Time" value={timeUsed} icon={Clock} color="text-purple-600" bg="bg-purple-50" />
            <StatCard label="Accuracy" value={`${percentage}%`} icon={BarChart2} color="text-green-600" bg="bg-green-50" />
          </div>

          {/* Detailed Analysis Area */}
          <div className="bg-[#EBF5FF] rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center mb-8">
             
             {/* Left: Dynamic Donut Chart */}
             <div className="flex flex-col items-center">
               <h4 className="font-bold text-gray-900 mb-6">Answer Distribution</h4>
               <div className="relative w-48 h-48 rounded-full flex items-center justify-center bg-white shadow-xl"
                    style={{ background: chartGradient }}
               >
                 <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center flex-col z-10">
                   <span className="text-xs text-gray-400 uppercase font-bold">Total</span>
                   <span className="text-3xl font-black text-gray-900">{totalQuestions}</span>
                 </div>
               </div>
               {/* Legend */}
               <div className="flex gap-4 mt-6 text-xs font-bold text-gray-500">
                 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#4CAF50]"/> {correctCount} Correct</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#FF4D4D]"/> {incorrectCount} Wrong</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#FFB020]"/> {skippedCount} Skipped</div>
               </div>
             </div>

             {/* Right: Topper Comparison Table */}
             <div className="flex-1 w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FFD8A8] text-orange-900">
                    <tr>
                      <th className="p-4 font-bold">Metric</th>
                      <th className="p-4 font-bold">You</th>
                      <th className="p-4 font-bold">Topper</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="p-4 font-medium text-gray-600">Score</td>
                      <td className="p-4 font-bold text-gray-900">{score}</td>
                      <td className="p-4 text-gray-500">{topperScore}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="p-4 font-medium text-gray-600">Time Taken</td>
                      <td className="p-4 font-bold text-gray-900">{timeUsed}</td>
                      <td className="p-4 text-gray-500">{topperTime}</td>
                    </tr>
                    <tr className="bg-[#FFECB3]">
                      <td className="p-4 font-bold text-orange-900">Accuracy</td>
                      <td className="p-4 font-bold text-orange-900">{percentage}%</td>
                      <td className="p-4 font-bold text-orange-900">98%</td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-center gap-4">
            <Link 
               href={`/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}`} 
               className="px-8 py-3 bg-[#448AFF] text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retake Test
            </Link>
            <Link 
              href={`/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/review/${attemptId}`} 
              className="px-8 py-3 bg-[#00C853] text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-all flex items-center gap-2"
            >
              <ListTodo className="w-4 h-4" /> Review Solutions
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className={`p-5 rounded-2xl border border-gray-100 shadow-sm ${bg} bg-opacity-50`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
      </div>
      <div className="text-2xl font-black text-gray-800">{value}</div>
    </div>
  )
}