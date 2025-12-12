import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SchoolSettingsForm from './school-settings-form'

export default async function SchoolSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // 1. Get the admin's organization ID
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

      <SchoolSettingsForm 
        school={school} 
        organizationId={profile.organization_id} 
      />
    </div>
  )
}