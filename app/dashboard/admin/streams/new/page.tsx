import { createStreamAction } from '../actions'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewStreamPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/streams" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Streams
      </Link>
      
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Create New Stream</h1>
        <form action={createStreamAction} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
              <input name="title" type="text" placeholder="e.g. Engineering" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Sort Order</label>
              <input name="order_index" type="number" defaultValue="1" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
            <textarea name="description" rows={3} placeholder="Brief description of this stream..." className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Icon Key</label>
              <select name="icon_key" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white transition-all">
                <option value="PenTool">Pen Tool (Engineering)</option>
                <option value="Stethoscope">Stethoscope (Medical)</option>
                <option value="Briefcase">Briefcase (Management)</option>
                <option value="Scale">Scale (Law)</option>
                <option value="GraduationCap">Graduation Cap (General)</option>
                <option value="Globe">Globe (Others)</option>
                <option value="Sparkles">Sparkles</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Maps to Lucide Icons used in the app.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Background Color</label>
              <select name="bg_color" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white transition-all">
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
            <Save className="w-4 h-4" /> Create Stream
          </button>
        </form>
      </div>
    </div>
  )
}