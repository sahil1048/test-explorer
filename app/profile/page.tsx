import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react' // Added Lock icon
import ProfileForm from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 bg-white rounded-full border border-gray-200 text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
          </div>
          
          {/* Change Password Button */}
          <Link 
            href="/update-password" 
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-all shadow-sm"
          >
            <Lock className="w-4 h-4" /> Change Password
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover / Header Banner */}
          <div className="h-32 bg-linear-to-r from-blue-600 to-purple-600 relative">
             <div className="absolute -bottom-12 left-8">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                   <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400 uppercase">
                      {profile?.full_name?.[0] || 'U'}
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-16 pb-8 px-8">
             <div className="mb-8">
               <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h2>
               <p className="text-sm font-medium text-gray-500 capitalize">{profile?.role?.replace('_', ' ')} Account</p>
             </div>

             <ProfileForm profile={profile} email={user.email} />
          </div>
        </div>

      </div>
    </div>
  )
}