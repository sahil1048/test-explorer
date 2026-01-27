import { headers } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school";
import SignupForm from "@/components/auth/SignupForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: { next?: string; school?: string; email?: string }
}) {
  // 1. AUTH CHECK: If user is already logged in, redirect them immediately
  // This handles the case where a logged-in user clicks an Ad button
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Redirect to the 'next' URL (e.g., /course/123) or default dashboard
    redirect(searchParams.next || '/dashboard/student');
  }

  // 2. DETECT SUBDOMAIN (Your existing logic)
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  let subdomain = null;

  const parts = hostname.split(".");
  if (hostname.includes("localhost")) {
    // Handle localhost (e.g., school.localhost:3000)
    if (parts.length >= 2) subdomain = parts[0];
  } else {
    // Handle production (e.g., school.testexplorer.com)
    if (parts.length >= 3) subdomain = parts[0];
  }

  // 3. FETCH SCHOOL DATA
  let school = null;

  // Priority A: If Subdomain exists, fetch school by Subdomain
  if (subdomain && subdomain !== "www" && subdomain !== "test-explorer") {
    school = await getSchoolBySubdomain(subdomain);
  } 
  // Priority B: If no Subdomain, check URL params (e.g., ?school=123 from Ad Link)
  else if (searchParams.school) {
    const { data } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', searchParams.school)
      .single();
    
    if (data) school = data;
  }

  // 4. RENDER CLIENT FORM
  return (
    <SignupForm 
      school={school} 
      redirectTo={searchParams.next}       // Pass the redirect URL to the form
      prefilledEmail={searchParams.email}  // Pass email if present in URL
    />
  );
}