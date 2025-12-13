import { headers } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school";

// Import your Hero variations
import HeroMain from "@/components/landing/hero-main";
import HeroSchool from "@/components/landing/hero-school";

// Import Footer
import Footer from "@/components/landing/footer";
import Features from "@/components/landing/features";
import Steps from "@/components/landing/steps";
import Testimonials from "@/components/landing/testimonials";
import Faq from "@/components/landing/faq";

// Import Shared Content Sections


export default async function LandingPage() {
  // 1. Detect Subdomain Logic
  const headersList = await headers();
  const hostname = headersList.get("host") || "";

  console.log("--------------------------------------------------");
  console.log("🔍 Current Hostname:", hostname);

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

  console.log("🔍 Detected Subdomain:", subdomain);

  // 3. Fetch School Data
  if (subdomain && subdomain !== "www" && subdomain !== "test-explorer") {
    schoolData = await getSchoolBySubdomain(subdomain);
    console.log("🏫 School Data Found:", schoolData ? schoolData.name : "None");
  } else {
    console.log("🌍 Loading Main Site (No School Data)");
  }
  console.log("--------------------------------------------------");

  // Fetch School Data if valid subdomain found
  if (subdomain && subdomain !== "www" && subdomain !== "test-explorer") {
    schoolData = await getSchoolBySubdomain(subdomain);
  }

  return (
    <main className="flex flex-col min-h-screen">
      
      {/* === SECTION 1: DYNAMIC HERO === */}
      {/* If we have school data, show the School Hero. Otherwise, show Main Hero. */}
      {schoolData ? (
        <HeroSchool school={schoolData} />
      ) : (
        <HeroMain />
      )}

      {/* === SECTION 2: SHARED CONTENT === */}
      {/* These sections appear on BOTH the main site and school sites */}

        <Features />

        <Steps />

        <Testimonials />

      <Faq />

      {/* === SECTION 3: FOOTER === */}
      <Footer school={schoolData} /> 
    </main>
  );
}