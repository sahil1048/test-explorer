import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response('Error: CLERK_WEBHOOK_SECRET is missing', { status: 500 })
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    return new Response('Error verifying webhook', { status: 400 })
  }

  // Handle User Creation
  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;

    const email = email_addresses[0]?.email_address;
    const phone = phone_numbers?.[0]?.phone_number; // Get phone if available
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();

    // Use Service Role to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin.from('profiles').insert({
      id: id,
      full_name: fullName,
      email: email,
      // Make sure your 'profiles' table has a 'phone' column if you want this:
      // phone: phone, 
      role: 'student', 
      // We explicitly set organization_id to null initially.
      // The /api/auth/sync route will fill this in a split second later.
      organization_id: null 
    });

    if (error) console.error('Supabase Insert Error:', error);
  }

  return new Response('', { status: 200 })
}