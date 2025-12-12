import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SignupForm from '@/app/components/auth/SignupForm'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SchoolSignupPage({ 
  params 
}: { 
  params: Promise<{ schoolSlug: string }> 
}) {
  const supabase = await createClient()
  const { schoolSlug } = await params

  const { data: school } = await supabase
    .from('organizations')
    .select('name, logo_url')
    .eq('slug', schoolSlug)
    .single()

  if (!school) return notFound()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left: Branding */}
      <div className="hidden md:flex w-1/2 bg-blue-600 items-center justify-center p-12 relative overflow-hidden text-white">
        <div className="absolute top-8 left-8">
           <Link href="/" className="flex items-center gap-2 text-blue-100 hover:text-white font-bold text-sm">
             <ArrowLeft className="w-4 h-4" /> Back to Home
           </Link>
        </div>
        <div className="text-center max-w-md relative z-10">
          <h1 className="text-4xl font-black mb-4">Join {school.name}</h1>
          <p className="text-xl text-blue-100">Create your student account to access preparatory modules and tests.</p>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="md:hidden absolute top-8 left-8">
           <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm">
             <ArrowLeft className="w-4 h-4" /> Back
           </Link>
        </div>
        <SignupForm schoolSlug={schoolSlug} schoolName={school.name} />
      </div>
    </div>
  )
}