import { createClient } from '@/lib/supabase/server'
import { Plus, Settings, Play, Database } from 'lucide-react'
import BlueprintCreator from '@/components/admin/blueprint-creator' // We'll make this next
import GenerateButton from '@/components/admin/blueprint-generate-button' // And this

export default async function BlueprintPage() {
  const supabase = await createClient()

  // Fetch Courses with their Subjects
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title, subjects(id, title)')
    .order('title')

  // Fetch Existing Blueprints
  const { data: blueprints } = await supabase
    .from('mock_blueprints')
    .select('*, courses(title), items:mock_blueprint_items(question_count, subjects(title))')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Mock Blueprints</h1>
          <p className="text-gray-500">Define criteria for full-course mock tests.</p>
        </div>
        <BlueprintCreator courses={courses || []} />
      </div>

      <div className="grid gap-6">
        {blueprints?.map((bp) => (
          <div key={bp.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                   {bp.courses?.title}
                 </span>
                 <h3 className="text-xl font-bold text-gray-900">{bp.title}</h3>
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="font-medium">⏱ {bp.total_duration_minutes} mins</span>
                <span className="font-medium">🎯 {bp.total_marks} marks</span>
              </div>

              {/* Items List */}
              <div className="mt-4 flex flex-wrap gap-2">
                {bp.items.map((item: any) => (
                  <div key={item.subjects.title} className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
                    <Database className="w-3 h-3 text-gray-400" />
                    <span className="font-bold text-gray-700">{item.question_count}</span>
                    <span className="text-gray-500">{item.subjects.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
               <GenerateButton blueprintId={bp.id} />
            </div>

          </div>
        ))}

        {(!blueprints || blueprints.length === 0) && (
          <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            No blueprints defined. Click "Create Blueprint" to start.
          </div>
        )}
      </div>
    </div>
  )
}