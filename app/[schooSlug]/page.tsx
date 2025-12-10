import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function SchoolLandingPage({ params }: { params: { schoolSlug: string } }) {
  const supabase = await createClient();
  const { schoolSlug } = params;

  // 1. Fetch School Branding based on URL slug
  const { data: school, error } = await supabase
    .from('schools')
    .select('name, logo_url, hero_image_url, welcome_message, id')
    .eq('slug', schoolSlug)
    .single();

  if (error || !school) {
    return notFound(); // Shows 404 if school doesn't exist
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Dynamic Header */}
      <header className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {school.logo_url ? (
            <Image 
              src={school.logo_url} 
              alt={`${school.name} Logo`} 
              width={50} 
              height={50} 
              className="object-contain"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {school.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-800">{school.name}</h1>
        </div>
        
        <Link 
          href={`/${schoolSlug}/login`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Student Login
        </Link>
      </header>

      {/* Dynamic Hero Section */}
      <main className="flex-1">
        <div className="relative w-full h-[400px] bg-gray-900">
          {school.hero_image_url && (
            <Image
              src={school.hero_image_url}
              alt="School Campus"
              fill
              className="object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to the Exam Portal
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl">
              {school.welcome_message || "Empowering students to achieve excellence through our comprehensive testing platform."}
            </p>
          </div>
        </div>

        {/* Global CUET Section (Same for everyone) */}
        <div className="max-w-5xl mx-auto py-16 px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900">Prepare for CUET</h3>
            <p className="text-gray-600 mt-2">Access world-class content provided by our central team.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {['Expert Syllabus', 'Mock Tests', 'Performance Analytics'].map((feature) => (
              <div key={feature} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center text-blue-600">
                  {/* Icon placeholder */}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature}</h4>
                <p className="text-gray-600">Standardized testing material ensuring you are ready for the national level exams.</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 text-center">
        <p>© {new Date().getFullYear()} {school.name}. Powered by YourPlatformName.</p>
      </footer>
    </div>
  );
}