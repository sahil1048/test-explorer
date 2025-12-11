import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  BookOpen, 
  Trophy, 
  Users, 
  ArrowRight, 
  Layout, 
  CheckCircle2 
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// 1. Update the Props Type to be a Promise
export default async function SchoolLandingPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const supabase = await createClient();
  
  // 2. AWAIT the params before using them (Crucial for Next.js 15)
  const { schoolSlug } = await params;

  console.log("------------------------------------------------");
  console.log("🔍 Looking for slug:", schoolSlug);

  // 3. Fetch School Branding
  const { data: school, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', schoolSlug)
    .single();

  if (error) {
    console.error("❌ Supabase Error:", error.message);
    console.error("   Details:", error.details);
  }

  if (!school) {
    console.error("⚠️ No data returned. Check RLS policies or Slug typo.");
  } else {
    console.log("✅ School found:", school.name);
  }
  console.log("------------------------------------------------");

  if (error || !school) {
    return notFound();
  }

  // Default fallbacks
  const heroImage = school.hero_image_url || "/leftman.png";
  const welcomeText = school.welcome_message || `Welcome to the official ${school.name} Exam Preparation Portal. Powered by best-in-class technology to help you succeed.`;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      
      {/* --- School Navbar --- */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            {school.logo_url ? (
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <Image 
                  src={school.logo_url} 
                  alt={`${school.name} Logo`} 
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-xl">
                {school.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{school.name}</h1>
              <p className="text-xs text-gray-500 font-medium">Official Exam Portal</p>
            </div>
          </div>

          <Link 
            href="/sign-in"
            className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg"
          >
            Student Login
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[500px] md:h-[600px] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage}
              alt="Campus"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
          </div>

          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/30 border border-blue-400/30 backdrop-blur-sm text-blue-100 text-sm font-medium mb-6">
                <Trophy className="w-4 h-4" />
                <span>Excellence in Education</span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Empowering Future <br/>
                <span className="text-blue-400">Leaders</span>
              </h2>
              
              <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                {welcomeText}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href={`/${schoolSlug}/login`}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  Start Practicing
                  <Layout className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <div className="bg-slate-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Verified Students", val: "100%", icon: Users },
                { label: "Premium Content", val: "Unlimited", icon: BookOpen },
                { label: "Exam Format", val: "NTA Pattern", icon: Layout },
                { label: "School Ranking", val: "Top Tier", icon: Trophy },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">{stat.val}</div>
                    <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Info Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="w-full md:w-1/2 relative">
                <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-10"></div>
                <div className="relative h-[400px] bg-slate-100 rounded-3xl border border-gray-200 overflow-hidden shadow-2xl flex items-center justify-center">
                   <div className="text-center p-8">
                     <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <Layout className="w-10 h-10" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-800 mb-2">Real Exam Interface</h3>
                     <p className="text-gray-500">Practice exactly how you play.</p>
                   </div>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Comprehensive Preparation <br/>
                  Provided by <span className="text-blue-600">Test Explorer</span>
                </h3>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  As a student of {school.name}, you get exclusive access to our central question bank. 
                  Every test is curated by national experts to ensure you are ready for CUET.
                </p>

                <ul className="space-y-4">
                  {[
                    "National Level Benchmarking",
                    "Detailed Topic-wise Analytics",
                    "Full Mock Test Series",
                    "Instant Doubt Resolution"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-white font-semibold text-lg">{school.name}</p>
            <p className="text-sm mt-1">Powered by Test Explorer Platform</p>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Support</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}