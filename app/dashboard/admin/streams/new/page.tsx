'use client'

import { useState, useMemo } from 'react'
import { createStreamAction } from '../actions' 
import { ArrowLeft, Save, Search, X } from 'lucide-react'
import Link from 'next/link'
import * as LucideIcons from 'lucide-react'

// 1. Get all valid icon names from the library
const iconList = Object.keys(LucideIcons).filter((key) => isNaN(Number(key)) && key !== 'createLucideIcon' && key !== 'default')

// Helper to render dynamic icon safely
const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name]
  if (!IconComponent) return <LucideIcons.HelpCircle className={className} />
  return <IconComponent className={className} />
}

export default function NewStreamPage() {
  const [iconName, setIconName] = useState('PenTool')
  const [bgColor, setBgColor] = useState('#CEFF1A')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Icon Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return iconList.slice(0, 100) // Show first 100 by default for performance
    return iconList.filter(name => name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 100)
  }, [searchQuery])

  async function handleSubmit(formData: FormData) {
    const rawColor = formData.get('color_picker') as string
    const formattedClass = `bg-[${rawColor}]`
    formData.set('bg_color', formattedClass)
    await createStreamAction(formData)
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Link href="/dashboard/admin/streams" className="flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Streams
      </Link>
      
      <div className="grid lg:grid-cols-2 gap-10">
        
        {/* --- LEFT: THE FORM --- */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm h-fit">
          <h1 className="text-2xl font-black text-gray-900 mb-6">Create New Stream</h1>
          
          <form action={handleSubmit} className="space-y-6">
            
            {/* Title & Order */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Title</label>
                <input 
                  name="title" 
                  type="text" 
                  placeholder="e.g. Engineering" 
                  required 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Sort Order</label>
                <input name="order_index" type="number" defaultValue="1" className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
              <textarea 
                name="description" 
                rows={3} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..." 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" 
              />
            </div>

            {/* --- NEW VISUAL ICON PICKER --- */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Icon</label>
              
              <div className="flex gap-3">
                {/* Selected Icon Preview */}
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 shrink-0">
                   <DynamicIcon name={iconName} className="w-6 h-6 text-gray-900" />
                </div>

                {/* Open Picker Button */}
                <button 
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-left text-sm font-medium text-gray-700 hover:border-black transition-all flex items-center justify-between"
                >
                  <span>{iconName}</span>
                  <span className="text-xs bg-black text-white px-2 py-1 rounded">Change</span>
                </button>
                
                {/* Hidden Input for Form Submission */}
                <input type="hidden" name="icon_key" value={iconName} />
              </div>
            </div>

            {/* --- COLOR SELECTION --- */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Background Color</label>
              <div className="flex items-center gap-4">
                <input 
                  name="color_picker" 
                  type="color" 
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-12 w-20 p-1 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input 
                  type="text" 
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none font-mono uppercase"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg">
              <Save className="w-4 h-4" /> Create Stream
            </button>
          </form>
        </div>

        {/* --- RIGHT: LIVE PREVIEW --- */}
        <div className="space-y-6">
           <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px] sticky top-8">
              <p className="text-sm font-bold text-gray-400 mb-8 tracking-widest uppercase">Live Preview</p>
              
              <div 
                className="w-64 aspect-square rounded-4xl p-6 flex flex-col justify-between shadow-xl transition-all duration-300"
                style={{ backgroundColor: bgColor }}
              >
                 <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <DynamicIcon name={iconName} className="w-6 h-6 text-gray-900" />
                 </div>

                 <div className="text-left">
                    <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">
                      {title || 'Stream Title'}
                    </h3>
                    <p className="text-sm font-medium text-gray-900/60 line-clamp-2">
                      {description || 'Description will appear here...'}
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </div>

      {/* --- ICON PICKER MODAL --- */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Select an Icon</h2>
              <button onClick={() => setIsPickerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search icons (e.g. user, book, chart)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                />
              </div>
            </div>

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                {filteredIcons.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setIconName(name)
                      setIsPickerOpen(false)
                    }}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all hover:scale-105 ${
                      iconName === name ? 'bg-black text-white border-black' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <DynamicIcon name={name} className="w-6 h-6" />
                  </button>
                ))}
              </div>
              {filteredIcons.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  No icons found for "{searchQuery}"
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-400">
              Showing top matching results
            </div>

          </div>
        </div>
      )}

    </div>
  )
}