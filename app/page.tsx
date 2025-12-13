import { createClient } from '@/lib/supabase/server';
import LandingPage from '@/components/Home/LandingPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    // FIXED: Use select('*') to avoid "column not found" errors
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // If profile exists, use it. 
    // Fallback only if data is null (shouldn't happen now)
    profile = data || { 
      full_name: user.email?.split('@')[0] || 'Student', 
      role: 'student', 
      organization_id: null // Updated from school_id to match DB
    };
  }

  // Pass user.email explicitly so UserNav can display it
  return <LandingPage />;
}