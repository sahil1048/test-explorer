import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  Trophy, 
  Clock, 
  Target, 
  BarChart2, 
  RotateCcw, 
  X,
} from 'lucide-react'

export default async function ResultPage({ 
  params 
}: { 
  params: Promise<{ courseId: string, subjectId: string, examId: string; attemptId: string }> 
}) {
  const supabase = await createClient()
  const { examId, attemptId, courseId, subjectId } = await params

  // Fetch Data
  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .single()

  const { data: exam } = await supabase
    .from('exams')
    .select('title')
    .eq('id', examId)
    .single()

  if (!attempt) return <div>Result not found</div>

  const score = attempt.score || 0
  const total = attempt.total_marks || 20
  const percentage = ((score / total) * 100).toFixed(2)
  const timeUsed = `${Math.floor(attempt.time_taken_seconds / 60)}:${(attempt.time_taken_seconds % 60).toString().padStart(2, '0')}`

  // Dummy Topper Data (Matches Screenshot)
  const topperScore = total - 1
  const topperTime = timeUsed

  return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm fixed inset-0 z-50">
      <div className="bg-[#FFF8F0] w-full max-w-5xl h-[90vh] rounded-[2rem] overflow-y-auto relative shadow-2xl">
        
        {/* Close Button */}
        <Link 
          href={`/courses/${courseId}/subjects/${subjectId}`} 
          className="absolute top-6 right-6 p-2 bg-[#FF6B35] rounded-full text-white hover:bg-[#E85D2E] transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </Link>

        <div className="p-8 md:p-12">
          
          {/* Header */}
          <div className="text-center mb-10">
            <button className="bg-[#FF6B35] text-white px-8 py-2 rounded-xl font-bold text-lg shadow-lg shadow-orange-200">
              Report
            </button>
          </div>

          {/* --- User Stats Row --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Score" value={`${score}/${total}`} icon={Target} color="text-blue-600" />
            <StatCard label="Rank" value="1/1" icon={Trophy} color="text-orange-600" />
            <StatCard label="Time" value={timeUsed} icon={Clock} color="text-gray-600" />
            <StatCard label="Percentage" value={`${percentage}%`} icon={BarChart2} color="text-red-500" />
          </div>

          {/* --- Topper Stats Row --- */}
          <div className="mb-12">
            <h3 className="text-gray-800 font-bold mb-4 ml-1">Topper's Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#FFF] p-6 rounded-2xl border border-[#FFE8D6] shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-blue-50 rounded-xl"><Target className="w-6 h-6 text-blue-500"/></div>
                 <div className="flex-1">
                   <div className="flex justify-between mb-2 text-sm font-bold text-gray-500">
                     <span>Topper's Score</span> <span className="text-orange-500">{topperScore}/{total}</span>
                   </div>
                   <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-gray-800 w-[95%] rounded-full" />
                   </div>
                 </div>
              </div>
              <div className="bg-[#FFF] p-6 rounded-2xl border border-[#FFE8D6] shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-orange-50 rounded-xl"><Clock className="w-6 h-6 text-orange-500"/></div>
                 <div className="flex-1">
                   <div className="flex justify-between mb-2 text-sm font-bold text-gray-500">
                     <span>Topper's Time</span> <span className="text-orange-500">{topperTime}</span>
                   </div>
                   <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-orange-400 w-[80%] rounded-full" />
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* --- Analysis Charts Section (Donut & Table) --- */}
          <div className="bg-[#EBF5FF] rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center">
             
             {/* Left: Donut Chart (CSS Implementation) */}
             <div className="flex flex-col items-center">
               <h4 className="font-bold text-gray-900 mb-6">Answer Distribution</h4>
               <div className="relative w-48 h-48 rounded-full flex items-center justify-center bg-white shadow-xl"
                    style={{
                      background: `conic-gradient(#FF4D4D 0% 33%, #FFB020 33% 66%, #4CAF50 66% 100%)`
                    }}
               >
                 <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center flex-col z-10">
                   <span className="text-xs text-gray-400 uppercase font-bold">Total</span>
                   <span className="text-3xl font-black text-gray-900">{total}</span>
                 </div>
               </div>
               {/* Legend */}
               <div className="flex gap-4 mt-6 text-xs font-bold text-gray-500">
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#4CAF50]"/> Correct</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FF4D4D]"/> Incorrect</div>
                 <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FFB020]"/> Skipped</div>
               </div>
             </div>

             {/* Right: Table */}
             <div className="flex-1 w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FFD8A8] text-orange-900">
                    <tr>
                      <th className="p-4 font-bold">Section</th>
                      <th className="p-4 font-bold">Score</th>
                      <th className="p-4 font-bold">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="p-4 font-medium text-gray-600">{exam?.title || 'General Section'}</td>
                      <td className="p-4 font-bold text-gray-900">{score}/{total}</td>
                      <td className="p-4 text-gray-500">{timeUsed}</td>
                    </tr>
                    <tr className="bg-[#FFECB3]">
                      <td className="p-4 font-bold text-orange-900">Total</td>
                      <td className="p-4 font-bold text-orange-900">{score}/{total}</td>
                      <td className="p-4 font-bold text-orange-900">{timeUsed}</td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <Link 
               href={`/courses/${courseId}/subjects/${subjectId}/test/${examId}`} 
               className="px-8 py-3 bg-[#448AFF] text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-all"
            >
              Retake Test
            </Link>
            <Link 
               href={`/courses/${courseId}/subjects/${subjectId}`} 
               className="px-8 py-3 bg-[#00C853] text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition-all"
            >
              Review Test
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-[#FFF] p-5 rounded-2xl border border-[#FFE8D6] shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
      </div>
      <div className="text-2xl font-black text-gray-800">{value}</div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
         <div className="h-full bg-gray-800 w-3/4 rounded-full"/>
      </div>
    </div>
  )
}