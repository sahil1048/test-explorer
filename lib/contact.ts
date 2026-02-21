"use client"; // Note: Use this if you want to handle toast notifications, 
              // or keep it purely server-side by removing this and using a Server Action file.

import { createClient } from "@/lib/supabase/client"; // Use client-side or server-side based on your setup

export async function submitContactForm(formData: FormData, schoolId: string | null) {
  const supabase = createClient();

  const name = `${formData.get("firstName")} ${formData.get("lastName")}`;
  const email = formData.get("email");
  const message = formData.get("message");

  const { data, error } = await supabase
    .from("contact_messages")
    .insert([
      { 
        name, 
        email, 
        message, 
        organization_id: schoolId, // Links message to a specific school if on a subdomain
        status: 'unread',
        created_at: new Date().toISOString()
      }
    ]);

  if (error) throw new Error(error.message);
  return { success: true };
}