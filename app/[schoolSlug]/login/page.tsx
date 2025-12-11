import { createClient } from '@/lib/supabase/server';
import { login } from '@/app/auth/actions';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import LoginForm from './login-form'; // We'll separate the client form

export const dynamic = 'force-dynamic';

export default async function SchoolLoginPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const supabase = await createClient();
  const { schoolSlug } = await params;

  // 1. Fetch School Branding
  const { data: school, error } = await supabase
    .from('schools')
    .select('name, logo_url, hero_image_url')
    .eq('slug', schoolSlug)
    .single();

  if (error || !school) {
    return notFound();
  }

  // Fallback visuals
  const bgImage = school.hero_image_url || "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1986&auto=format&fit=crop";

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
      
      {/* --- Background Layer with Blur --- */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Background"
          fill
          className="object-cover opacity-90"
          priority
        />
        {/* Modern Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-md bg-white/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent" />
      </div>

      {/* --- Navigation --- */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href={`/${schoolSlug}`}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-sm font-semibold text-gray-700 backdrop-blur-sm transition-all shadow-sm border border-white/50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* --- Main Card --- */}
      <div className="relative z-10 w-full max-w-[420px]">
        
        {/* The Glass Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
          
          {/* School Identity Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-6 shadow-sm border border-white/50 flex items-center justify-center p-3">
              {school.logo_url ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={school.logo_url} 
                    alt={school.name} 
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-800">
                  {school.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
              Student Portal
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Login to access {school.name} resources
            </p>
          </div>

          {/* Client-Side Form Component */}
          <LoginForm />

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <Link 
              href="/forgot-password" 
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Trouble logging in? Contact Support
            </Link>
          </div>

        </div>
        
        {/* Branding Footer */}
        <p className="text-center text-xs text-gray-500 mt-6 font-medium">
          Powered by <span className="text-gray-900">Test Explorer</span>
        </p>
      </div>
    </div>
  );
}