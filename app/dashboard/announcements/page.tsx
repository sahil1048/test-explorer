import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAnnouncementAction, deleteAnnouncementAction } from './actions'
import { Megaphone, Trash2, Plus, Bell } from 'lucide-react'

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return redirect('/login')

  // 1. Get User's School
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) return <div>You are not assigned to a school.</div>

  // 2. Fetch Announcements
  const { data: announcements } = await supabase
    .from('school_announcements')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-100 rounded-xl">
           <Megaphone className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Announcements</h1>
          <p className="text-gray-500 font-medium">Manage updates for your school landing page.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-8 gap-8">
        
        {/* CREATE FORM */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New
            </h2>
            <form action={createAnnouncementAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Headline</label>
                <input name="title" required placeholder="e.g. Exam Schedule Released" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">Content</label>
                <textarea name="content" required rows={4} placeholder="Details about the announcement..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm font-medium resize-none" />
              </div>
              <button type="submit" className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all text-sm">
                Post Announcement
              </button>
            </form>
          </div>
        </div>

        {/* LIST */}
        <div className="lg:col-span-4 space-y-4 h-[700px] overflow-auto">
           {(!announcements || announcements.length === 0) ? (
             <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 font-medium">No announcements yet.</p>
             </div>
           ) : (
             announcements.map((item) => (
               <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm group hover:border-orange-200 transition-colors">
                 <div className="flex justify-between items-start gap-4">
                   <div>
                     <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                     <p className="text-gray-600 text-sm leading-relaxed">{item.content}</p>
                     <p className="text-xs text-gray-400 mt-3 font-medium">
                       Posted on {new Date(item.created_at).toLocaleDateString()}
                     </p>
                   </div>
                   <form action={deleteAnnouncementAction}>
                     <input type="hidden" name="id" value={item.id} />
                     <button type="submit" className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </form>
                 </div>
               </div>
             ))
           )}
        </div>

      </div>
    </div>
  )
}