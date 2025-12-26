import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowUpRight, Sparkles, Layers } from 'lucide-react'
import * as LucideIcons from 'lucide-react' // <--- 1. Import all icons

export default async function CategoriesPage() {
  const supabase = await createClient()

  // 1. Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order_index')

  return (
    <div className="min-h-screen bg-white">

      <main className="container mx-auto px-6 py-16">
        
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            Select Your Stream
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-[0.9]">
            What are you <br/><span className="text-blue-600">aiming</span> for?
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-xl">
            Choose your field to find the perfect exams and preparation material tailored for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((cat) => {
            // --- 2. DYNAMIC ICON LOGIC ---
            // @ts-ignore
            const Icon = LucideIcons[cat.icon_key] || Layers

            // --- 3. DYNAMIC COLOR LOGIC ---
            const rawBg = cat.bg_color || 'bg-gray-50'
            // Check if it is a custom hex class like "bg-[#123456]"
            const isArbitrary = rawBg.startsWith('bg-[#') && rawBg.endsWith(']')
            // Extract the hex code if it is arbitrary, otherwise null
            const hexColor = isArbitrary ? rawBg.slice(4, -1) : null
            
            // If we have a hex, remove the class. If not, keep the Tailwind class.
            const finalClass = hexColor ? '' : rawBg
            const finalStyle = hexColor ? { backgroundColor: hexColor } : undefined

            return (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.id}`}
                className="group relative block"
              >
                <div 
                  className={`
                    relative z-10 h-full p-8 rounded-[2.5rem] border-2 border-black 
                    transition-all duration-300 ease-out
                    group-hover:-translate-y-2 group-hover:translate-x-1 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    ${finalClass} 
                  `}
                  style={finalStyle}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-white border-2 border-black rounded-2xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-black" />
                    </div>
                    <div className="bg-white rounded-full p-3 border-2 border-black transition-transform group-hover:rotate-45">
                      <ArrowUpRight className="w-5 h-5 text-black" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-black text-black mb-2 tracking-tight">
                      {cat.title}
                    </h3>
                    <p className="text-black/70 font-bold text-sm">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

      </main>
    </div>
  )
}