import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Layers } from 'lucide-react'
import { deleteStreamAction } from './actions'
import * as LucideIcons from 'lucide-react' // Import icons for preview

// Helper to render icon
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name]
  if (!IconComponent) return <Layers className={className} />
  return <IconComponent className={className} />
}

export default async function StreamsAdminPage() {
  const supabase = await createClient()
  const { data: streams } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Streams</h1>
          <p className="text-gray-500">Manage high-level categories like Engineering, Medical, etc.</p>
        </div>
        <Link 
          href="/dashboard/admin/streams/new" 
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Stream
        </Link>
      </div>

      <div className="grid gap-4">
        {(!streams || streams.length === 0) ? (
          <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <p className="text-gray-400 font-medium">No streams found. Add one to get started.</p>
          </div>
        ) : (
          streams.map((stream) => {
            // --- COLOR FIX LOGIC ---
            const rawBg = stream.bg_color || 'bg-gray-100'
            
            // Check if it's our custom format: bg-[#123456]
            const isArbitrary = rawBg.startsWith('bg-[#') && rawBg.endsWith(']')
            
            // If arbitrary, extract hex (#123456). If standard (bg-red-500), keep as class.
            const hexColor = isArbitrary ? rawBg.slice(4, -1) : null
            const finalClass = hexColor ? '' : rawBg
            const finalStyle = hexColor ? { backgroundColor: hexColor } : undefined
            // -----------------------

            return (
              <div key={stream.id} className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-center group hover:border-blue-400 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  
                  {/* Visual Indicator with Fixed Color Logic */}
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 border-black/10 ${finalClass}`}
                    style={finalStyle}
                  >
                     {/* Show the actual icon instead of just the number */}
                     <DynamicIcon name={stream.icon_key} className="w-5 h-5 text-gray-900 opacity-70" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{stream.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                        Order: {stream.order_index}
                      </span>
                      <span>•</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                        Icon: {stream.icon_key}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <Link 
                     href={`/dashboard/admin/streams/${stream.id}/edit`} 
                     className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                   >
                     <Pencil className="w-5 h-5" />
                   </Link>
                   <form action={deleteStreamAction}>
                     <input type="hidden" name="id" value={stream.id} />
                     <button 
                       type="submit" 
                       className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                   </form>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}