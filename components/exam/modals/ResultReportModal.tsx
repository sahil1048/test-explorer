'use client'

import { X, Trophy, Clock, Target, BarChart2 } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface SectionStat {
  subject: string
  score: number
  total: number
}

interface Props {
  examTitle?: string // Made optional for safety
  score: number
  totalMarks: number
  correctCount: number
  incorrectCount: number
  unattemptedCount: number
  timeTaken: number
  sections?: SectionStat[] // Made optional for safety
  onClose: () => void 
}

export const ResultReportModal = ({ 
  examTitle = 'Test Result', // Default value
  score, 
  totalMarks, 
  correctCount, 
  incorrectCount, 
  unattemptedCount, 
  timeTaken, 
  sections = [], // ✅ FIX: Default to empty array to prevent "undefined" crash
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
      <div className="bg-[#F3F4F6] w-full max-w-6xl h-[90vh] flex flex-col rounded-lg shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-white p-4 flex justify-between items-center shadow-sm">
           <h2 className="text-xl font-bold text-gray-700 uppercase">{examTitle} REPORT</h2>
           <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full transition"><X className="text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
           {/* Badge */}
           <div className="flex justify-center mb-6">
              <span className="bg-[#FFC107] text-white px-6 py-1.5 rounded text-sm font-bold shadow-sm">
                Final Result
              </span>
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCard icon={<Target size={20}/>} color="blue" label="Score" value={`${score}/${totalMarks}`} />
              <StatsCard icon={<Trophy size={20}/>} color="yellow" label="Rank" value="1/1" /> 
              <StatsCard icon={<Clock size={20}/>} color="orange" label="Time" value={formatTime(timeTaken)} />
              <StatsCard icon={<BarChart2 size={20}/>} color="purple" label="Percentage" value={`${percentage}%`} />
           </div>

           {/* Charts Section */}
           <div className="grid md:grid-cols-2 gap-6">
              
              {/* Answer Distribution */}
              <div className="bg-white p-6 rounded shadow-sm flex flex-col items-center">
                 <h3 className="font-bold text-gray-700 mb-4">Answer Distribution</h3>
                 <div className="w-48 h-48 relative">
                    <Doughnut 
                        data={doughnutData} 
                        options={{ cutout: '70%', plugins: { legend: { display: false } } }} 
                    />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                       <span className="text-xs text-gray-500">Total Qs</span>
                       <span className="font-bold text-2xl">{correctCount + incorrectCount + unattemptedCount}</span>
                    </div>
                 </div>
                 <div className="mt-6 w-full space-y-2 text-xs">
                    <LegendItem color="bg-blue-500" label="Correct" value={correctCount} />
                    <LegendItem color="bg-red-500" label="Incorrect" value={incorrectCount} />
                    <LegendItem color="bg-gray-300" label="Unattempted" value={unattemptedCount} />
                 </div>
              </div>

              {/* Sectional Analysis */}
              <div className="bg-white p-6 rounded shadow-sm flex flex-col">
                 <h3 className="font-bold text-gray-700 mb-4">Sectional Analysis</h3>
                 <div className="overflow-x-auto">
                   <table className="w-full text-xs text-left">
                      <thead>
                         <tr className="border-b text-gray-500">
                            <th className="py-2">Section</th>
                            <th className="py-2 text-right">Obtained</th>
                            <th className="py-2 text-right">Total</th>
                            <th className="py-2 text-right">%</th>
                         </tr>
                      </thead>
                      <tbody>
                         {/* ✅ FIX: Check if sections exist. If not, show a 'General' row using main stats */}
                         {sections && sections.length > 0 ? (
                           sections.map((section, idx) => (
                             <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-3 font-medium text-gray-800">{section.subject}</td>
                                <td className="py-3 text-right font-bold text-blue-600">{section.score}</td>
                                <td className="py-3 text-right text-gray-500">/ {section.total}</td>
                                <td className="py-3 text-right">
                                  {section.total > 0 ? Math.round((section.score / section.total) * 100) : 0}%
                                </td>
                             </tr>
                           ))
                         ) : (
                           // Fallback Row if no sections are returned
                           <tr className="border-b last:border-0 hover:bg-gray-50">
                              <td className="py-3 font-medium text-gray-800">General / Overall</td>
                              <td className="py-3 text-right font-bold text-blue-600">{score}</td>
                              <td className="py-3 text-right text-gray-500">/ {totalMarks}</td>
                              <td className="py-3 text-right">{percentage}%</td>
                           </tr>
                         )}
                         
                         {/* Grand Total Row */}
                         <tr className="bg-gray-50 font-bold border-t-2 border-gray-100">
                            <td className="py-3 pl-2">Total</td>
                            <td className="py-3 text-right text-blue-700">{score}</td>
                            <td className="py-3 text-right text-gray-700">/ {totalMarks}</td>
                            <td className="py-3 text-right">{percentage}%</td>
                         </tr>
                      </tbody>
                   </table>
                 </div>
              </div>
           </div>

           <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="bg-blue-600 text-white px-8 py-2.5 rounded font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Finish Review
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}

// -- Sub Components --
const StatsCard = ({ icon, color, label, value }: { icon: any, color: string, label: string, value: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  }
  return (
    <div className="bg-white p-4 rounded shadow-sm flex items-center gap-3">
       <div className={`p-2 rounded-full ${colorMap[color]}`}>{icon}</div>
       <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="font-bold text-gray-800 text-lg">{value}</div>
       </div>
    </div>
  )
}

const LegendItem = ({ color, label, value }: { color: string, label: string, value: number }) => (
  <div className="flex justify-between items-center">
    <span className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`}></span> 
      {label}
    </span> 
    <span className="font-bold text-gray-700">{value}</span>
  </div>
)