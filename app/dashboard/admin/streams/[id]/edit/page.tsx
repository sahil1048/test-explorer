import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditStreamForm from './edit-stream-form'

export default async function EditStreamPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: stream } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (!stream) return notFound()

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/streams" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Streams
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Edit Stream: {stream.title}</h1>
        <EditStreamForm stream={stream} />
      </div>
    </div>
  )
}