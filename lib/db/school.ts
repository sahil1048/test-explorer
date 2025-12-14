import { createClient } from "@/lib/supabase/server"; // Adjust path to your server client

export async function getSchoolBySubdomain(slug: string) {
  const supabase = await createClient();

  try {
    const { data: school, error } = await supabase
      .from('organizations') // Replace with your actual table name (e.g., 'tenants', 'organizations')
      .select('*')
      .eq('slug', slug)
      .single();


    if (error) {
      return null;
    }

    return school;
  } catch (err) {
    return null;
  }
}