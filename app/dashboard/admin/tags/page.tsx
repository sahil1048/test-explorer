import { createClient } from '@/lib/supabase/server'
import { createTagAction, deleteTagAction } from './actions'
import { Trash2, Tag as TagIcon, Plus } from 'lucide-react'

export default async function TagsPage() {
  const supabase = await createClient()
  
  // Fetch existing tags
  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex items-center gap-2 mb-8">
        <div className="p-3 bg-black rounded-xl">
           <TagIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Manage Tags</h1>
          <p className="text-gray-500">Create standard tags for your blog posts.</p>
        </div>
      </div>

      {/* Create Tag Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Add New Tag</h3>
        <form action={createTagAction} className="flex gap-4">
          <input 
            name="name" 
            type="text" 
            required
            placeholder="e.g. Technology, Exams, News"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
          />
          <button 
            type="submit" 
            className="bg-black text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>

      {/* Tags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags?.map((tag) => (
          <div key={tag.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-black transition-colors">
            <span className="font-bold text-gray-700">{tag.name}</span>
            <form action={deleteTagAction}>
              <input type="hidden" name="id" value={tag.id} />
              <button type="submit" className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        ))}
        {tags?.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400">
            No tags created yet.
          </div>
        )}
      </div>

    </div>
  )
}