import { createClient } from '@/lib/supabase/server'
import CommunicationCenter from '@/features/communication/components/communication-center'

export default async function CommunicationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null }
  const canManage = ['super_admin', 'school_admin', 'teacher'].includes(profile?.role ?? '')
  return <CommunicationCenter canManage={canManage} />
}
