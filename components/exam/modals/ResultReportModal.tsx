import { X, Trophy, Clock, Target, BarChart2 } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  score: number
  totalMarks: number
  correctCount: number
  incorrectCount: number
  unattemptedCount: number
  timeTaken: number
  onClose: () => void // Or redirect to home
}

export const ResultReportModal = ({ score, totalMarks, correctCount, incorrectCount, unattemptedCount, timeTaken, onClose }: Props) => {
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const percentage = Math.round((score / totalMarks) * 100) || 0

  const doughnutData = {
    labels: ['Correct', 'Incorrect', 'Unattempted'],
    datasets: [
      {
        data: [correctCount, incorrectCount, unattemptedCount],
        backgroundColor: ['#3B82F6', '#EF4444', '#E5E7EB'], // Blue, Red, Gray
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-[#F3F4F6] w-full max-w-6xl h-[90vh] flex flex-col rounded-lg shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-white p-4 flex justify-between items-center shadow-sm">
           <h2 className="text-xl font-bold text-gray-700">GENERAL ENGLISH MOCK TEST REPORT</h2>
           <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           <div className="flex justify-center mb-6">
              <span className="bg-[#FFC107] text-white px-6 py-1.5 rounded text-sm font-bold shadow-sm">Report</span>
           </div>

           {/* Stats Row 1 */}
           <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded shadow-sm flex items-center gap-3">
                 <div className="p-2 bg-blue-100 rounded-full text-blue-600"><Target size={20}/></div>
                 <div>
                    <div className="text-xs text-gray-500">Score</div>
                    <div className="font-bold text-gray-800">{score}/{totalMarks}</div>
                 </div>
              </div>
              <div className="bg-white p-4 rounded shadow-sm flex items-center gap-3">
                 <div className="p-2 bg-yellow-100 rounded-full text-yellow-600"><Trophy size={20}/></div>
                 <div>
                    <div className="text-xs text-gray-500">Rank</div>
                    <div className="font-bold text-gray-800">1/1</div>
                 </div>
              </div>
              <div className="bg-white p-4 rounded shadow-sm flex items-center gap-3">
                 <div className="p-2 bg-orange-100 rounded-full text-orange-600"><Clock size={20}/></div>
                 <div>
                    <div className="text-xs text-gray-500">Time</div>
                    <div className="font-bold text-gray-800">{formatTime(timeTaken)}</div>
                 </div>
              </div>
              <div className="bg-white p-4 rounded shadow-sm flex items-center gap-3">
                 <div className="p-2 bg-purple-100 rounded-full text-purple-600"><BarChart2 size={20}/></div>
                 <div>
                    <div className="text-xs text-gray-500">Percentage</div>
                    <div className="font-bold text-gray-800">{percentage}%</div>
                 </div>
              </div>
           </div>

           {/* Charts Section */}
           <div className="grid grid-cols-2 gap-6">
              {/* Answer Distribution */}
              <div className="bg-white p-6 rounded shadow-sm flex flex-col items-center">
                 <h3 className="font-bold text-gray-700 mb-4">Answer Distribution</h3>
                 <div className="w-48 h-48 relative">
                    <Doughnut 
                        data={doughnutData} 
                        options={{ cutout: '60%', plugins: { legend: { display: false } } }} 
                    />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                       <span className="text-xs text-gray-500">Total</span>
                       <span className="font-bold text-xl">{correctCount + incorrectCount + unattemptedCount}</span>
                    </div>
                 </div>
                 <div className="mt-6 w-full space-y-2 text-xs">
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Correct</span> <span>{correctCount}</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> Incorrect</span> <span>{incorrectCount}</span></div>
                    <div className="flex justify-between items-center"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Unattempted</span> <span>{unattemptedCount}</span></div>
                 </div>
              </div>

              {/* Time Analysis (Simplified for visual match) */}
              <div className="bg-white p-6 rounded shadow-sm flex flex-col">
                 <h3 className="font-bold text-gray-700 mb-4">Sectional Analysis</h3>
                 <table className="w-full text-xs text-left">
                    <thead>
                       <tr className="border-b">
                          <th className="py-2">Section</th>
                          <th className="py-2">Score</th>
                          <th className="py-2">Time</th>
                       </tr>
                    </thead>
                    <tbody>
                       <tr className="border-b">
                          <td className="py-2">General English</td>
                          <td className="py-2">{score}/{totalMarks}</td>
                          <td className="py-2">{formatTime(timeTaken)}</td>
                       </tr>
                       <tr className="font-bold">
                          <td className="py-2">Total</td>
                          <td className="py-2">{score}/{totalMarks}</td>
                          <td className="py-2">{formatTime(timeTaken)}</td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>

           <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">Go Home</button>
           </div>
        </div>
      </div>
    </div>
  )
}