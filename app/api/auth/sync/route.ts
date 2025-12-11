import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const user = await currentUser();
  
  // If not logged in, they can't be synced
  if (!user) return redirect('/sign-in');

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug'); // Get slug from URL parameters

  // Use Service Role to update the profile securely
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let organizationId = null;

  // 1. If slug exists (e.g., 'dps'), find that school
  if (slug) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single();
    if (org) organizationId = org.id;
  }

  // 2. If no slug (Homepage), find 'test_explorer'
  if (!organizationId) {
    const { data: defaultOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'test_explorer')
      .single();
    if (defaultOrg) organizationId = defaultOrg.id;
  }

  // 3. Update the Profile in Supabase
  if (organizationId) {
    await supabase
      .from('profiles')
      .update({ organization_id: organizationId })
      .eq('id', user.id);
  }

  // 4. Redirect user to their dashboard
  return redirect('/dashboard');
}