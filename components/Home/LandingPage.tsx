import { headers } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school";

// Import your Hero variations
import HeroMain from "@/components/landing/hero-main";
import HeroSchool from "@/components/landing/hero-school";

// Import Shared Content Sections
import Footer from "@/components/landing/footer";
import Features from "@/components/landing/features";
import Steps from "@/components/landing/steps";
import Testimonials from "@/components/landing/testimonials";
import Faq from "@/components/landing/faq";

// Import New Section
import SchoolUpdates from "@/components/landing/school-updates";

export default async function LandingPage() {
  // 1. Detect Subdomain Logic
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  let schoolData = null;

  const parts = hostname.split(".");
  let subdomain = null;

  if (hostname.includes("localhost")) {
    // Localhost logic: dps.localhost:3000 (parts[0] = dps)
    if (parts.length >= 2) subdomain = parts[0];
  } else {
    // Production logic: dps.testexplorer.com (parts[0] = dps)
    if (parts.length >= 3) subdomain = parts[0];
  }

  // 3. Fetch School Data
  if (subdomain && subdomain !== "www" && subdomain !== "testexplorer") {
    schoolData = await getSchoolBySubdomain(subdomain);
  }

  return (
    <main className="flex flex-col min-h-screen">
      
      {/* === SECTION 1: DYNAMIC HERO === */}
      {schoolData ? (
        <HeroSchool school={schoolData} />
      ) : (
        <HeroMain />
      )}

      {/* === SECTION 1.5: SCHOOL SPECIFIC UPDATES (Only on Subdomain) === */}
      {schoolData && (
        <SchoolUpdates school={schoolData} />
      )}

      {/* === SECTION 2: SHARED CONTENT === */}
      <Steps />
      <Features />
      <Testimonials />
      <Faq />

      {/* === SECTION 3: FOOTER === */}
      <Footer school={schoolData} /> 
    </main>
  );
}