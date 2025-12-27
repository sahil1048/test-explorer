import Link from 'next/link'
import { ArrowRight, Layers } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Button } from "@/components/ui/button"

interface Category {
  id: string
  title: string
  description?: string | null // Allow null/undefined from DB
  icon_key?: string | null
  bg_color?: string | null
}

export default function CategoryGrid({ categories }: { categories: Category[] | null }) {
  if (!categories || categories.length === 0) {
    return <div className="text-gray-500">No categories found.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 container mx-auto bg-white">
      {categories.map((cat) => {
        // Dynamic Icon Logic
        // @ts-ignore
        const Icon = LucideIcons[cat.icon_key] || Layers

        // Dynamic Color Logic
        const rawBg = cat.bg_color || 'bg-gray-50'
        const isArbitrary = rawBg.startsWith('bg-[#') && rawBg.endsWith(']')
        const hexColor = isArbitrary ? rawBg.slice(4, -1) : null
        
        const finalClass = hexColor ? '' : rawBg
        const finalStyle = hexColor ? { backgroundColor: hexColor } : undefined

        return (
          <Link 
            key={cat.id} 
            href={`/categories/${cat.id}`}
            className="group relative block text-left" 
          >
            <div 
              className={`
                relative z-10 h-full px-2 py-6 rounded-[2.5rem] border-2 border-black flex items-center flex-col space-y-6 justify-center
                transition-all duration-300 ease-out
                group-hover:-translate-y-2 group-hover:translate-x-1 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                ${finalClass} 
              `}
              style={finalStyle}
            >
              <div className='text-center space-y-2 px-2'>
                <h3 className="text-xl font-black text-black tracking-tight leading-tight">
                  {cat.title}
                </h3>
                <p className="text-black/70 font-bold text-xs line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <Button variant="outline" className='rounded-full text-xs border-black bg-white hover:bg-black hover:text-white transition-colors h-8'>
                Take Mock Test <ArrowRight className='w-3 h-3 ml-1'/>
              </Button>
            </div>
          </Link>
        )
      })}
    </div>
  )
}