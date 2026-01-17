import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowUpRight, Sparkles, Layers } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { redirect } from 'next/navigation'

// Mapping Profile Stream -> Database Category Keyword
const STREAM_KEYWORDS: Record<string, string> = {
  'Non-Medical': 'Engineering', // Matches "Engineering Entrance", "JEE", etc.
  'Medical': 'Medical',         // Matches "Medical Entrance", "NEET", etc.
  'Commerce': 'Management',     // Matches "Management", "BBA", etc.
  'Arts/Humanities': 'Law',     // Matches "Law", "CLAT", etc.
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  // 1. Check User Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Fetch User's Stream
  const { data: profile } = await supabase
    .from('profiles')
    .select('stream')
    .eq('id', user.id)
    .single()

  // 3. Construct Query
  // Start by selecting all categories
  let query = supabase
    .from('categories')
    .select('*')
    .order('order_index')

  // 4. Apply Smart Filter (Stream + CUET)
  if (profile?.stream) {
    const streamKeyword = STREAM_KEYWORDS[profile.stream]

    if (streamKeyword) {
      // Filter: Title matches User's Stream Keyword OR Title matches 'CUET'
      // We use 'ilike' for case-insensitive partial matching (e.g. "Engineering" matches "Engineering Exams")
      query = query.or(`title.ilike.%${streamKeyword}%,title.ilike.%CUET%`)
    }
  }

  const { data: categories } = await query

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
            Based on your stream <strong>{profile?.stream}</strong>, we have curated the best exam categories for you (including CUET).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((cat) => {
            // --- DYNAMIC ICON LOGIC ---
            // @ts-ignore
            const Icon = LucideIcons[cat.icon_key] || Layers

            // --- DYNAMIC COLOR LOGIC ---
            const rawBg = cat.bg_color || 'bg-gray-50'
            const isArbitrary = rawBg.startsWith('bg-[#') && rawBg.endsWith(']')
            const hexColor = isArbitrary ? rawBg.slice(4, -1) : null
            
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

          {(!categories || categories.length === 0) && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50">
              <p className="text-gray-500 font-bold">No categories found matching your stream.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}