import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import LandingPage from '@/app/components/Home/LandingPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Get Clerk User ID
  const { userId, getToken } = await auth();

  let profile = null;

  if (userId) {
    // 2. Fetch Profile from Supabase using Clerk Token
    const token = await getToken({ template: 'supabase' });
    
    // Create a temporary client with the token to respect RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    profile = data;
  }

  return <LandingPage profile={profile} />;
}