import { createClient } from '@/lib/supabase/server'
import RankUploader from '@/components/admin/rank-uploader'
import { BarChart3 } from 'lucide-react'

export default async function RankPredictionPage() {
  const supabase = await createClient()

  // CHANGED: Fetch Categories -> Courses -> Rank Data Count
  const { data: streams } = await supabase
    .from('categories')
    .select(`
      id, 
      title, 
      courses (
        id, 
        title, 
        exam_rank_predictions(count) 
      )
    `)
    .order('title')

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Rank Predictor Config</h1>
          <p className="text-gray-500 font-medium">Upload "Marks vs Rank" CSV for each Exam (Course).</p>
        </div>
      </div>

      <RankUploader streams={streams || []} />
    </div>
  )
}