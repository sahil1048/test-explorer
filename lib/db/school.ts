import { createClient } from "@/lib/supabase/server"; // Adjust path to your server client

export async function getSchoolBySubdomain(slug: string) {
  const supabase = await createClient();

  try {
    const { data: school, error } = await supabase
      .from('organizations') // Replace with your actual table name (e.g., 'tenants', 'organizations')
      .select('*')
      .eq('slug', slug)
      .single();

      console.log(`Fetching subdomain: ${slug}`, school);

    if (error) {
      console.error("Error fetching school:", error);
      return null;
    }

    return school;
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
}