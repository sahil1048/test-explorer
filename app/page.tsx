import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LandingPage from '@/app/components/Home/LandingPage';

export default async function Home() {
  // 1. Check Authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. If no user, show the public Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // 3. If user exists, fetch their Role to know where to send them
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single();

  // 4. Role-Based Redirection Logic
  if (profile) {
    switch (profile.role) {
      case 'super_admin':
        // Super Admins go to their content management area
        redirect('/dashboard/courses');
        break;
        
      case 'school_admin':
        // School Admins go to their school settings
        redirect('/dashboard/settings');
        break;
        
      case 'student':
        // Students go to their exam portal
        redirect('/dashboard/my-courses');
        break;
        
      default:
        // Fallback for unknown roles
        redirect('/login');
    }
  }

  // Safety fallback if profile fetch fails
  return <LandingPage />;
}