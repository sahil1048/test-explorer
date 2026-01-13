'use client'

import { X, Trophy, Clock, Target, BarChart2, BookOpen, Crown, Sparkles } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import Link from 'next/link'

ChartJS.register(ArcElement, Tooltip, Legend)

interface SectionStat {
  subject: string
  score: number
  total: number
}

interface Props {
  examTitle?: string
  score: number
  totalMarks: number
  correctCount: number
  incorrectCount: number
  unattemptedCount: number
  timeTaken: number
  sections?: SectionStat[]
  reviewUrl?: string 
  // ✅ NEW PROPS
  predictedRank?: string | null
  predictedPercentile?: string | null
  onClose: () => void 
}

export const ResultReportModal = ({ 
  examTitle = 'Test Result',
  score, 
  totalMarks, 
  correctCount, 
  incorrectCount, 
  unattemptedCount, 
  timeTaken, 
  sections = [],
  reviewUrl, 
  predictedRank,
  predictedPercentile,
  onClose 
}: Props) => {
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0

  const doughnutData = {
    labels: ['Correct', 'Incorrect', 'Unattempted'],
    datasets: [
      {
        data: [correctCount, incorrectCount, unattemptedCount],
        backgroundColor: ['#3B82F6', '#EF4444', '#E5E7EB'], 
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-[#F3F4F6] w-full max-w-6xl h-[90vh] flex flex-col rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-white p-4 flex justify-between items-center shadow-sm z-20 relative">
           <h2 className="text-xl font-bold text-gray-700 uppercase flex items-center gap-2">
             <Trophy className="w-5 h-5 text-yellow-500" />
             {examTitle} REPORT
           </h2>
           <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition"><X className="text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
           
           {/* Badge */}
           <div className="flex justify-center mb-6">
              <span className="bg-[#FFC107] text-white px-6 py-1.5 rounded-full text-xs font-bold shadow-sm tracking-wider uppercase">
                Final Result
              </span>
           </div>

           {/* ✅ GAMIFIED RANK CARD (Conditional) */}
           {(predictedRank || predictedPercentile) && (
             <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
               {/* Background Decor */}
               <div className="absolute -right-4 -bottom-8 opacity-10 rotate-12">
                 <Crown size={140} />
               </div>

               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                   <div className="flex items-center gap-2 mb-2 text-indigo-200 font-bold uppercase tracking-wider text-xs">
                     <Sparkles className="w-4 h-4 text-yellow-300" /> AI Performance Insight
                   </div>
                   <h3 className="text-2xl font-black leading-tight">Great Effort! Here is your standing.</h3>
                   <p className="text-indigo-100 text-sm opacity-90 mt-1">Projected based on historical cut-offs for this score range.</p>
                 </div>

                 <div className="flex gap-4">
                    {predictedRank && (
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[140px] border border-white/20 text-center shadow-lg">
                        <div className="text-[10px] text-indigo-200 font-bold uppercase mb-1 tracking-wider">Approx Rank</div>
                        <div className="text-3xl font-black text-white">{predictedRank}</div>
                      </div>
                    )}
                    {predictedPercentile && (
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[140px] border border-white/20 text-center shadow-lg">
                        <div className="text-[10px] text-indigo-200 font-bold uppercase mb-1 tracking-wider">Percentile</div>
                        <div className="text-3xl font-black text-white">{predictedPercentile}</div>
                      </div>
                    )}
                 </div>
               </div>
             </div>
           )}

           {/* Stats Cards */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCard icon={<Target size={20}/>} color="blue" label="Score" value={`${score}/${totalMarks}`} />
              <StatsCard icon={<Trophy size={20}/>} color="yellow" label="Rank" value={predictedRank ? "See Above" : "1/1"} /> 
              <StatsCard icon={<Clock size={20}/>} color="orange" label="Time" value={formatTime(timeTaken)} />
              <StatsCard icon={<BarChart2 size={20}/>} color="purple" label="Percentage" value={`${percentage}%`} />
           </div>

           {/* Charts Section */}
           <div className="grid md:grid-cols-2 gap-6">
              
              {/* Answer Distribution */}
              <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center border border-gray-100">
                 <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Answer Distribution</h3>
                 <div className="w-48 h-48 relative">
                    <Doughnut 
                        data={doughnutData} 
                        options={{ cutout: '75%', plugins: { legend: { display: false } } }} 
                    />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                       <span className="text-xs text-gray-400 font-bold uppercase">Total Qs</span>
                       <span className="font-black text-3xl text-gray-800">{correctCount + incorrectCount + unattemptedCount}</span>
                    </div>
                 </div>
                 <div className="mt-6 w-full space-y-3 text-xs">
                    <LegendItem color="bg-blue-500" label="Correct Answers" value={correctCount} />
                    <LegendItem color="bg-red-500" label="Incorrect Answers" value={incorrectCount} />
                    <LegendItem color="bg-gray-300" label="Unattempted" value={unattemptedCount} />
                 </div>
              </div>

              {/* Sectional Analysis */}
              <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col border border-gray-100">
                 <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Sectional Analysis</h3>
                 <div className="overflow-x-auto">
                   <table className="w-full text-xs text-left">
                      <thead>
                         <tr className="border-b border-gray-100 text-gray-400">
                            <th className="py-3 font-bold uppercase">Section</th>
                            <th className="py-3 text-right font-bold uppercase">Obtained</th>
                            <th className="py-3 text-right font-bold uppercase">Total</th>
                            <th className="py-3 text-right font-bold uppercase">%</th>
                         </tr>
                      </thead>
                      <tbody>
                         {sections && sections.length > 0 ? (
                           sections.map((section, idx) => (
                             <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                <td className="py-3 font-bold text-gray-700">{section.subject}</td>
                                <td className="py-3 text-right font-bold text-blue-600">{section.score}</td>
                                <td className="py-3 text-right text-gray-400">/ {section.total}</td>
                                <td className="py-3 text-right font-medium text-gray-600">
                                  {section.total > 0 ? Math.round((section.score / section.total) * 100) : 0}%
                                </td>
                             </tr>
                           ))
                         ) : (
                           <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                              <td className="py-3 font-bold text-gray-700">Overall</td>
                              <td className="py-3 text-right font-bold text-blue-600">{score}</td>
                              <td className="py-3 text-right text-gray-400">/ {totalMarks}</td>
                              <td className="py-3 text-right font-medium text-gray-600">{percentage}%</td>
                           </tr>
                         )}
                         
                         <tr className="bg-gray-50/50 font-bold border-t border-gray-100">
                            <td className="py-4 pl-2 text-gray-900">Grand Total</td>
                            <td className="py-4 text-right text-blue-700 text-base">{score}</td>
                            <td className="py-4 text-right text-gray-500">/ {totalMarks}</td>
                            <td className="py-4 text-right text-gray-900">{percentage}%</td>
                         </tr>
                      </tbody>
                   </table>
                 </div>
              </div>
           </div>

           {/* 3. Footer Action Buttons */}
           <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
              {reviewUrl && (
                <Link 
                  href={reviewUrl}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Review Solutions
                </Link>
              )}
              
              <button 
                onClick={onClose} 
                className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
              >
                Finish & Close <ChevronRightIcon />
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}

// -- Sub Components --
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
)

const StatsCard = ({ icon, color, label, value }: { icon: any, color: string, label: string, value: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-100 hover:border-gray-200 transition-all">
       <div className={`p-3 rounded-xl ${colorMap[color]}`}>{icon}</div>
       <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
          <div className="font-black text-gray-800 text-xl">{value}</div>
       </div>
    </div>
  )
}

const LegendItem = ({ color, label, value }: { color: string, label: string, value: number }) => (
  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
    <span className="flex items-center gap-2 text-xs font-bold text-gray-600">
      <span className={`w-3 h-3 rounded-full ${color}`}></span> 
      {label}
    </span> 
    <span className="font-black text-gray-800 text-sm">{value}</span>
  </div>
)