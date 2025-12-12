import { createClient } from '@/lib/supabase/server'
import { updateStreamAction } from '../../actions' // Adjust import path if needed (../../actions)
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

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
        <form action={updateStreamAction} className="space-y-6">
          <input type="hidden" name="id" value={stream.id} />
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
              <input name="title" defaultValue={stream.title} type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Sort Order</label>
              <input name="order_index" defaultValue={stream.order_index} type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
            <textarea name="description" defaultValue={stream.description} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Icon Key</label>
              <select name="icon_key" defaultValue={stream.icon_key} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white transition-all">
                <option value="PenTool">Pen Tool (Engineering)</option>
                <option value="Stethoscope">Stethoscope (Medical)</option>
                <option value="Briefcase">Briefcase (Management)</option>
                <option value="Scale">Scale (Law)</option>
                <option value="GraduationCap">Graduation Cap (General)</option>
                <option value="Globe">Globe (Others)</option>
                <option value="Sparkles">Sparkles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Background Color</label>
              <select name="bg_color" defaultValue={stream.bg_color} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white transition-all">
                <option value="bg-[#CEFF1A]">Neon Lime</option>
                <option value="bg-[#D4F5FF]">Soft Cyan</option>
                <option value="bg-[#E5D4FF]">Soft Purple</option>
                <option value="bg-[#FFD4D4]">Soft Red</option>
                <option value="bg-[#FFC8DD]">Soft Pink</option>
                <option value="bg-[#FFF4C3]">Soft Yellow</option>
                <option value="bg-gray-100">Gray</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </form>
      </div>
    </div>
  )
}