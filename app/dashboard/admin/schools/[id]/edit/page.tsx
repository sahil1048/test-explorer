import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditSchoolForm from './edit-school-form'

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
        
        <EditSchoolForm school={school} />
      </div>
    </div>
  )
}