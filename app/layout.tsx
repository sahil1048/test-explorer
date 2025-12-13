import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server"; 
import { getSchoolBySubdomain } from "@/lib/db/school"; 
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Initialize Supabase & User
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  // 2. ROBUST SUBDOMAIN DETECTION
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  
  let schoolData = null;
  let subdomain = null;

  // Split hostname into parts (e.g., "school.localhost:3000" -> ["school", "localhost:3000"])
  const parts = hostname.split(".");

  // LOGIC: Determine if there is a subdomain
  if (hostname.includes("localhost")) {
    // Localhost: school.localhost:3000 (needs at least 2 parts)
    if (parts.length >= 2) {
      subdomain = parts[0];
    }
  } else {
    // Production: school.testexplorer.com (needs at least 3 parts)
    // If you use a custom domain like school.com, adjust logic to check parts.length === 2
    if (parts.length >= 3) {
      subdomain = parts[0];
    }
  }

  // 3. Fetch School Data if Subdomain exists and is not 'www'
  if (subdomain && subdomain !== "www" && subdomain !== "test-explorer") {
    schoolData = await getSchoolBySubdomain(subdomain);
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        
        {/* Pass schoolData. If found, SiteHeader shows School Logo. If null, it shows Test Explorer. */}
        <SiteHeader 
          school={schoolData} 
          user={user} 
          profile={profile} 
        />

        <main>{children}</main>
        
      </body>
    </html>
  );
}