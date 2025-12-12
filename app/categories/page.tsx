import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { 
  ArrowUpRight, 
  PenTool, 
  Stethoscope, 
  Briefcase, 
  Scale, 
  GraduationCap,
  Sparkles,
  Globe 
} from 'lucide-react'
import UserNav from '@/components/Navbar/UserNav' // Import UserNav

// Map string keys from DB to actual components
const ICON_MAP: Record<string, any> = {
  PenTool, Stethoscope, Briefcase, Scale, GraduationCap, Globe
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  // 1. Fetch User Session & Profile (For Navbar)
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*') // Fetch necessary fields
      .eq('id', user.id)
      .single()
    
    // Fallback profile object if DB fetch fails but auth exists
    profile = data || { 
      full_name: user.email?.split('@')[0] || 'User', 
      role: 'student', 
      school_id: null 
    }
  }

  // 2. Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order_index')

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-50">
        <Link href="/" className="text-xl font-black tracking-tighter">Test Explorer</Link>
        
        {/* Dynamic Nav: Show Avatar if logged in, Login button if not */}
        <div className="flex items-center gap-4">
          {user && profile ? (
            <>
              <Link href="/dashboard" className="text-sm font-bold text-gray-500 hover:text-black hidden sm:block">
                My Dashboard
              </Link>
              <UserNav profile={profile} email={user.email} />
            </>
          ) : (
            <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-black">
              Login
            </Link>
          )}
        </div>
      </header>

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
            const Icon = ICON_MAP[cat.icon_key] || Globe
            
            return (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.id}`}
                className="group relative block"
              >
                <div className={`
                  relative z-10 h-full p-8 rounded-[2.5rem] border-2 border-black 
                  transition-all duration-300 ease-out
                  group-hover:-translate-y-2 group-hover:translate-x-1 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                  ${cat.bg_color || 'bg-gray-50'}
                `}>
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