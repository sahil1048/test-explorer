import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { updateSchoolAction } from '../../actions' // Import from parent actions

export default async function EditSchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch the School Data
  const { data: school } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (!school) return notFound()

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/schools" className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Schools
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="mb-8 border-b border-gray-100 pb-6">
           <h1 className="text-2xl font-black text-gray-900 mb-2">Edit School: {school.name}</h1>
           <p className="text-gray-500">Update core configuration details.</p>
        </div>
        
        <form action={updateSchoolAction} className="space-y-6">
          <input type="hidden" name="id" value={school.id} />

          {/* School Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">School Name</label>
            <input 
              name="name" 
              type="text" 
              defaultValue={school.name}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div>
          
          {/* Subdomain Slug */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Subdomain Slug</label>
            <div className="flex items-center">
              <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 text-gray-500 font-medium rounded-l-xl">
                testexplorer.in/
              </span>
              <input 
                name="slug" 
                type="text" 
                defaultValue={school.slug}
                required
                className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
              />
              
            </div>
            <p className="text-xs text-yellow-600 mt-2 font-medium">
              Warning: Changing this will break existing bookmarks for students.
            </p>
          </div>

          {/* Welcome Message */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Welcome Message</label>
            <textarea 
              name="welcome_message" 
              defaultValue={school.welcome_message}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div>

          <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all mt-4 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}