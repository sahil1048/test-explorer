import { createClient } from '@/lib/supabase/server'

export default async function StudentExamsPage() {
  const supabase = await createClient()
  
  // Fetch available exams
  // (Assuming you have an 'exams' table created later)
  const { data: exams } = await supabase
    .from('exams') 
    .select('id, title, subject, duration_minutes')
    .eq('is_published', true)
    .limit(10)

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Available Exams</h2>
        <p className="text-gray-500">Select a test to begin your preparation.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for when you have no exams yet */}
        {(!exams || exams.length === 0) && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">No exams available at the moment.</p>
          </div>
        )}

        {/* Exam Cards */}
        {exams?.map((exam) => (
          <div key={exam.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
              {exam.subject}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{exam.title}</h3>
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <span>{exam.duration_minutes} Minutes</span>
              <span className="mx-2">•</span>
              <span>NTA Pattern</span>
            </div>
            <button className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Start Test
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}