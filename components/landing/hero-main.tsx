import { createClient } from '@/lib/supabase/server'
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Layers } from "lucide-react";
import * as LucideIcons from 'lucide-react' // Import all icons for dynamic mapping
import { Button } from '../ui/button';
import CategoryGrid from '../categories/category-grid';

export default async function HeroMain() {
  const supabase = await createClient()

  // 1. Fetch Categories (sorted by order_index)
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order_index')
    // Optional: .limit(3) or .limit(6) if you only want to show a few in the hero

  return (
    <section className="relative pt-20 pb-12 overflow-hidden bg-white">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- Hero Content --- */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm mb-8 hover:scale-105 transition-transform cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-sm font-bold text-gray-700">#1 Platform for Exam Prep</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
            Ace Your Entrance Exams <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-pink-600">
              Without the Stress.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Unlimited mock tests, AI-driven analytics, and a community that actually helps you study.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
            >
              Start Practicing Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all hover:border-gray-300"
            >
              How it works
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm font-bold text-gray-400 grayscale opacity-70 mb-16">
            <span>TRUSTED BY 100+ SCHOOLS</span>
          </div>
        </div>

        {/* --- Categories Grid (Dynamic) --- */}
       {/* <CategoryGrid categories={categories}/> */}
      </div>
    </section>
  );
}