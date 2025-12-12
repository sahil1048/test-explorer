import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Building, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { deleteSchoolAction } from './actions'

export default async function ManageSchoolsPage() {
  const supabase = await createClient()

  // Fetch schools
  const { data: schools } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Schools</h1>
          <p className="text-gray-500 font-medium">Manage white-labeled clients.</p>
        </div>
        <Link 
          href="/dashboard/admin/schools/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          Add New School
        </Link>
      </div>

      <div className="grid gap-4">
        {schools?.map((school) => (
          <div key={school.id} className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-400 transition-all">
            
            {/* School Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                 {school.logo_url ? (
                   <img src={school.logo_url} alt={school.name} className="w-full h-full object-contain" />
                 ) : (
                   <Building className="w-8 h-8 text-gray-300" />
                 )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{school.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                    {school.slug}
                  </span>
                  <span>•</span>
                  <span>{new Date(school.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2">
               {/* 1. Visit Site */}
               <a 
                 href={`http://${school.slug}.localhost:3000`} 
                 target="_blank"
                 className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                 title="Visit Live Site"
               >
                 <ExternalLink className="w-5 h-5" />
               </a>

               {/* 2. Edit Button */}
               <Link
                 href={`/dashboard/admin/schools/${school.id}/edit`}
                 className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                 title="Edit Settings"
               >
                 <Pencil className="w-5 h-5" />
               </Link>

               {/* 3. Delete Action (Form) */}
               <form action={deleteSchoolAction}>
                 <input type="hidden" name="schoolId" value={school.id} />
                 <button 
                   type="submit"
                   className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                   title="Delete School"
                   // Add a simple confirmation
                   // Note: For a proper modal, we'd use a Client Component, but this works for simple actions
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
               </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}