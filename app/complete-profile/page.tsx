// app/complete-profile/page.tsx

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CompleteProfileForm from '@/components/complete-profile/complete-profile-form'
import { Sparkles } from 'lucide-react'

export default async function CompleteProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#faf9f6] flex items-center justify-center p-4 selection:bg-purple-200 selection:text-purple-900">
      
      {/* --- Aesthetic Background Blobs --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-yellow-100/60 rounded-full blur-[80px]" />

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 backdrop-blur-sm rounded-3xl mb-6 shadow-xl shadow-purple-100/50 rotate-3 hover:rotate-12 transition-all duration-500 cursor-default border border-white/50">
              <Sparkles className="w-8 h-8 text-purple-500 fill-purple-200" />
           </div>
           <h1 className="text-5xl font-black text-gray-800 tracking-tight mb-4">
             Let's get <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">personal.</span>
           </h1>
           <p className="text-xl text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
             Just a few details to make your <span className="font-bold text-gray-700">Test Explorer</span> experience uniquely yours.
           </p>
        </div>

        {/* Glass Card */}
        <div className="bg-white/40 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/60 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.08)] relative overflow-hidden group">
          
          {/* Subtle shimmer effect on card hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <CompleteProfileForm profile={profile} />
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm font-semibold text-gray-400 mt-8">
          🔒 Your information is encrypted & secure.
        </p>
      </div>
    </div>
  )
}