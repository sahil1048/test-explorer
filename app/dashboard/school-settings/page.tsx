import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SchoolSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // 1. Get the admin's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user?.id)
    .single()

  if (!profile?.organization_id) {
    return <div>Error: You are not linked to a school.</div>
  }

  // 2. Fetch School Details
  const { data: school } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single()

  return (
    <div className="max-w-4xl">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-gray-900">School Settings</h2>
        <p className="text-gray-500">Manage your white-label branding and information.</p>
      </div>

      <form className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Information</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input 
                type="text" 
                defaultValue={school.name}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain Slug</label>
              <input 
                type="text" 
                defaultValue={school.slug}
                disabled
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed" 
              />
              <p className="text-xs text-gray-500 mt-1">Contact support to change your subdomain.</p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
              <textarea 
                defaultValue={school.welcome_message}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                 <input type="text" defaultValue={school.logo_url} className="w-full px-4 py-2 rounded-lg border border-gray-300" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                 <input type="text" defaultValue={school.hero_image_url} className="w-full px-4 py-2 rounded-lg border border-gray-300" />
               </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}