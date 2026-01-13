import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server"; 
import { getSchoolBySubdomain } from "@/lib/db/school"; 
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next"; // Import Metadata type

// 1. ADD METADATA EXPORT
export const metadata: Metadata = {
  title: "Test Explorer",
  description: "Your learning journey starts here.",
  icons: {
    icon: "/favicon.ico", // This path works for both local and prod
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // --- CHANGED LOGIC START ---
  const headersList = await headers();
  const schoolSlug = headersList.get("x-school-slug"); // Read from middleware

  let schoolData = null;
  if (schoolSlug) {
    // We can reuse getSchoolBySubdomain if it just looks up by 'slug' column
    schoolData = await getSchoolBySubdomain(schoolSlug);
  }
  // --- CHANGED LOGIC END ---

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans antialiased" suppressHydrationWarning={true}>
        <SiteHeader 
          school={schoolData} 
          user={user} 
          profile={profile} 
          schoolSlug={schoolSlug} // Pass this so Header knows to format links
        />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}