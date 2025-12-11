import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // 1. Get the webhook secret from your .env
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // 2. Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // 3. Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // 4. Verify the payload with the headers
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // 5. Handle the "user.created" event
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } = evt.data;

    const email = email_addresses[0]?.email_address;
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();

    // Use the Service Role Key to bypass RLS and insert into profiles
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Extract school_id if you passed it via Clerk metadata (optional advanced step)
    // const schoolId = unsafe_metadata?.schoolId || null;

    const { error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: id,               // Clerk ID (e.g., user_2xyz...)
        full_name: fullName,
        role: 'student',      // Default role
        school_id: null,      // Default to null (Global student)
        // email: email       // Add this if you added an email column to profiles
      });

    if (error) {
        console.error('Error inserting user into Supabase:', error);
        return new Response('Error inserting user', { status: 500 });
    }
  }

  // 6. Handle "user.updated" (Optional but recommended)
  if (eventType === 'user.updated') {
    const { id, first_name, last_name } = evt.data;
    const fullName = `${first_name || ''} ${last_name || ''}`.trim();

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabaseAdmin
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', id);
  }

  return new Response('', { status: 200 })
}