import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server"; 
import { getSchoolBySubdomain } from "@/lib/db/school"; 
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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
  const domain = headersList.get("x-current-domain") || headersList.get("host") || "";
  const hostname = headersList.get("host") || "";
  
  let schoolData = null;
  let subdomain = null;

  // Split hostname into parts (e.g., "school.localhost:3000" -> ["school", "localhost:3000"])
  const parts = hostname.split(".");

  if (domain.includes("localhost")) {
    const parts = domain.split(".");
    if (parts.length >= 2) {
      subdomain = parts[0];
    }
  } else {
    const parts = domain.split(".");
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
      <body className="min-h-screen bg-gray-50 font-sans antialiased" suppressHydrationWarning={true}>
        
        {/* Pass schoolData. If found, SiteHeader shows School Logo. If null, it shows Test Explorer. */}
        <SiteHeader 
          school={schoolData} 
          user={user} 
          profile={profile} 
        />

        <main>{children}</main>

        <Toaster />
        
      </body>
    </html>
  );
}