import { createClient } from '@/lib/supabase/server'
import { Tag as TagIcon } from 'lucide-react'
import CreateTagForm from './create-tag-form'
import DeleteTagButton from './delete-tag-button'

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
        <CreateTagForm />
      </div>

      {/* Tags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags?.map((tag) => (
          <div key={tag.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-black transition-colors">
            <span className="font-bold text-gray-700">{tag.name}</span>
            <DeleteTagButton tagId={tag.id} />
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