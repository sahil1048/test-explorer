import { headers } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school";

// Import your Hero variations
import HeroMain from "@/components/landing/hero-main"; //
import HeroSchool from "@/components/landing/hero-school"; //

// Import Shared Content Sections
import Footer from "@/components/landing/footer"; //
import Features from "@/components/landing/features"; //
import Steps from "@/components/landing/steps"; //
import Testimonials from "@/components/landing/testimonials"; //
import Faq from "@/components/landing/faq"; //

// Import New Section
import SchoolUpdates from "@/components/landing/school-updates"; //
import CategoryGrid from "../categories/category-grid";
import { createClient } from "@/lib/supabase/server";
import TestimonialsAdminPage from "@/app/dashboard/testimonials/page";
import SchoolPromo from "../landing/school-promo";

export default async function LandingPage() {
  // 1. Detect School Slug from Headers (Set by Middleware)
  const headersList = await headers();
  const schoolSlug = headersList.get("x-school-slug"); // <--- CHANGED: Read Middleware Header
  const supabase = await createClient()
  
  let schoolData = null;

  // 2. Fetch School Data if Slug Exists
  if (schoolSlug) {
    // We assume getSchoolBySubdomain queries by the 'slug' column
    schoolData = await getSchoolBySubdomain(schoolSlug);
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('order_index')

    let schoolTestimonials = [];

  if (schoolSlug) {
    schoolData = await getSchoolBySubdomain(schoolSlug);

    if (schoolData) {
      // Fetch specific testimonials for this school
      const { data: tData } = await supabase
        .from('school_testimonials')
        .select('*')
        .eq('organization_id', schoolData.id)
        .order('created_at', { ascending: false });
        
      if (tData) schoolTestimonials = tData;
    }
  }

  return (
    <main className="flex flex-col min-h-screen">
      
      {/* === SECTION 1: DYNAMIC HERO === */}
      {schoolData ? (
        <HeroSchool school={schoolData} />
      ) : (
        <HeroMain />
      )}

      {/* === SECTION 1.5: SCHOOL SPECIFIC UPDATES (Only on School Page) === */}
      {schoolData && (
        <SchoolUpdates school={schoolData} />
      )}

      {/* === SECTION 2: SHARED CONTENT === */}
      <CategoryGrid categories={categories}/>
      <Steps />
      <Features />
      {schoolData ? (
  schoolTestimonials.length > 0 && <Testimonials data={schoolTestimonials} />
) : (
  <Testimonials />
)}
      <Faq />

      {/* === SECTION 3: FOOTER === */}
      <Footer school={schoolData} /> 
    </main>
  );
}