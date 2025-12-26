import { createClient } from '@/lib/supabase/server'
import { createExamAction } from '../actions'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import Link from 'next/link'

export default async function NewExamPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ type: string }> 
}) {
  const supabase = await createClient()
  const { type } = await searchParams
  const validTypes = ['prep', 'mock', 'practice']
  const currentType = validTypes.includes(type) ? type : 'prep'

  // Fetch Subjects for Dropdown
  const { data: subjects } = await supabase.from('subjects').select('id, title').order('title')

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link href="/dashboard/admin/exams" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
           <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase rounded-md tracking-widest">{currentType}</span>
           <h1 className="text-2xl font-black text-gray-900">Create New Entry</h1>
        </div>

        <form action={createExamAction} className="space-y-6">
          <input type="hidden" name="type" value={currentType} />

          {/* 1. Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
              <input name="title" type="text" placeholder="e.g. Algebra Basics" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
              <select name="subject_id" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white">
                <option value="">Select Subject</option>
                {subjects?.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
            <textarea name="description" rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
          </div>

          {/* 2. Specific Fields (Duration only for tests) */}
          {currentType !== 'prep' && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Duration (Minutes)</label>
              <input name="duration" type="number" defaultValue="60" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black" />
            </div>
          )}

          <div className="h-px bg-gray-100 my-2" />

          {/* 3. CSV Upload Section */}
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
            <h3 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Bulk Upload Questions
            </h3>
            <p className="text-sm text-blue-700/80 mb-4">
              Upload a CSV file with columns: <strong>Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation, Direction</strong>.
            </p>
            <input 
              type="file" 
              name="csv_file" 
              accept=".csv"
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
              "
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
             <input type="checkbox" name="is_published" id="pub" className="w-5 h-5 accent-black" />
             <label htmlFor="pub" className="text-sm font-medium text-gray-700">Publish immediately</label>
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 shadow-lg">
            Create & Upload
          </button>
        </form>
      </div>
    </div>
  )
}