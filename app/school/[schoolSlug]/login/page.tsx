import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LoginForm from '@/app/components/auth/LoginForm'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SchoolLoginPage({ 
  params 
}: { 
  params: Promise<{ schoolSlug: string }> 
}) {
  const supabase = await createClient()
  const { schoolSlug } = await params

  // Fetch School Info for branding
  const { data: school } = await supabase
    .from('organizations')
    .select('name, logo_url')
    .eq('slug', schoolSlug)
    .single()

  if (!school) return notFound()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left: Branding */}
      <div className="hidden md:flex w-1/2 bg-blue-600 items-center justify-center p-12 border-r border-gray-100 relative overflow-hidden">
        <div className="absolute top-8 left-8">
           <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm">
             <ArrowLeft className="w-4 h-4" /> Back to Home
           </Link>
        </div>
        <div className="text-center max-w-md relative z-10">
          {school.logo_url && (
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <Image src={school.logo_url} alt={school.name} fill className="object-contain" />
            </div>
          )}
          <h1 className="text-4xl font-black text-gray-900 mb-4">{school.name}</h1>
          <p className="text-xl text-white">Your official portal for exams and preparation.</p>
        </div>
        {/* Decorative Blob */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="md:hidden absolute top-8 left-8">
           <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm">
             <ArrowLeft className="w-4 h-4" /> Back
           </Link>
        </div>
        <LoginForm schoolSlug={schoolSlug} schoolName={school.name} />
      </div>
    </div>
  )
}