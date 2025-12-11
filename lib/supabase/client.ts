import { createClient } from '@supabase/supabase-js'

export function createClerkSupabaseClient(clerkToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        // This is the magic. It sends the Clerk Token to Supabase
        headers: { Authorization: `Bearer ${clerkToken}` },
      },
    }
  )
}