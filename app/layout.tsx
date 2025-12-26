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
  
  let schoolData = null;
  let subdomain = null;

  const parts = domain.split(".");

  if (domain.includes("localhost")) {
    if (parts.length >= 2) {
      subdomain = parts[0];
    }
  } else {
    if (parts.length >= 3) {
      subdomain = parts[0];
    }
  }

  if (subdomain && subdomain !== "www" && subdomain !== "testexplorer") {
    schoolData = await getSchoolBySubdomain(subdomain);
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans antialiased" suppressHydrationWarning={true}>
        
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