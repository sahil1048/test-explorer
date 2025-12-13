'use client'

import { Bell } from 'lucide-react'
import './marquee.css' // We will create this simple CSS file

export default function AnnouncementsCard({ announcements }: { announcements: any[] }) {
  if (!announcements || announcements.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-md mx-auto h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-[#FF6B35] p-4 flex items-center gap-3 shrink-0 z-10 shadow-sm">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white animate-pulse">
           <Bell className="w-5 h-5" />
        </div>
        <h3 className="font-black text-white text-lg tracking-wide uppercase">Notice Board</h3>
      </div>

      {/* Scrolling Content */}
      <div className="flex-1 relative overflow-hidden bg-white p-4">
        {/* The scrolling wrapper */}
        <div className="vertical-marquee space-y-4">
           {/* Duplicate list to create seamless loop effect if list is short */}
           {[...announcements, ...announcements].map((item, i) => (
             <div key={`${item.id}-${i}`} className="bg-orange-50 p-4 rounded-xl border border-orange-100">
               <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
               <p className="text-xs text-gray-600 leading-relaxed">{item.content}</p>
               <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                 {new Date(item.created_at).toLocaleDateString()}
               </div>
             </div>
           ))}
        </div>
        
        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-linear-to-b from-white to-transparent z-10 pointer-events-none"/>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent z-10 pointer-events-none"/>
      </div>
    </div>
  )
}