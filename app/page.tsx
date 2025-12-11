import { createClient } from '@/lib/supabase/server';
import LandingPage from '@/app/components/Home/LandingPage';

// 1. Force Next.js to not cache this page, so it always checks Auth
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  
  // 2. Get the current User
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    // 3. Fetch Profile Data
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role, school_id')
      .eq('id', user.id)
      .single();
    
    // If profile exists, use it. 
    // If not (rare case), we create a temporary fallback so they see the Avatar, not "Login"
    profile = data || { 
      full_name: user.email?.split('@')[0] || 'Student', 
      role: 'student', 
      school_id: null 
    };
  }

  // 4. Pass data to the UI
  return <LandingPage profile={profile} />;
}