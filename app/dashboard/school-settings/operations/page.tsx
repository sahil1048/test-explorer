import { createClient } from '@/lib/supabase/server'
import { OperationsSettings } from '@/features/school-administration/components/operations-settings'
import { redirect } from 'next/navigation'
export default async function Page(){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).single();if(!['school_admin','super_admin'].includes(profile?.role ?? ''))redirect('/dashboard');return <OperationsSettings/>}
