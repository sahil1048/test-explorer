import { ExamData } from '../types'

interface Props {
  timeLeft: number
  onConfirm: () => void
  onCancel: () => void
}

export const SubmitConfirmationModal = ({ timeLeft, onConfirm, onCancel }: Props) => {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')} : ${m.toString().padStart(2, '0')} : ${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-2xl p-8 flex flex-col items-center text-center">
        <h2 className="text-4xl font-normal text-gray-700 mb-6">Confirm</h2>
        
        <p className="text-gray-600 text-lg mb-2 leading-relaxed">
          You have {formatTime(timeLeft)} left. Clicking SUBMIT will end test, and you will not be allowed to attempt any more questions. Are you sure you want to End the test?
        </p>

        <div className="flex gap-4 mt-8 w-full justify-center">
           <button 
             onClick={onConfirm}
             className="bg-[#333333] hover:bg-black text-white px-8 py-2.5 rounded text-base font-medium transition-colors"
           >
             Submit
           </button>
           <button 
             onClick={onCancel}
             className="bg-[#333333] hover:bg-black text-white px-8 py-2.5 rounded text-base font-medium transition-colors"
           >
             Cancel
           </button>
        </div>
      </div>
    </div>
  )
}