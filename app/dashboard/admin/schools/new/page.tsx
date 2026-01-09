import { createClient } from '@supabase/supabase-js' // Use raw client for Admin actions
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ArrowLeft, Building2, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'

export default function AddSchoolPage() {
  
  async function createSchool(formData: FormData) {
    'use server'
    
    // 1. Initialize Admin Client (Bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, 
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 2. Extract Form Data
    const name = (formData.get('name') as string || '').trim()
    const slug = (formData.get('slug') as string || '').toLowerCase().trim().replace(/\s+/g, '-')
    const adminName = (formData.get('adminName') as string || '').trim()
    const email = (formData.get('email') as string || '').trim()
    const password = (formData.get('password') as string || '').trim()

    if (!name || !slug || !adminName || !email || !password) {
      throw new Error('All fields are required.')
    }

    // 3. Create the Organization (School)
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({ name, slug, welcome_message: `Welcome to ${name}` })
      .select()
      .single()

    if (orgError) {
      console.error('Org Error:', orgError)
      // CHANGE HERE: Throw instead of return
      throw new Error('Failed to create school. Slug might be taken.') 
    }

    // 4. Create the School Admin User (Auth)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: adminName }
    })

    if (authError) {
      console.error('Auth Error:', authError)
      // Cleanup orphan org
      await supabaseAdmin.from('organizations').delete().eq('id', org.id)
      // CHANGE HERE: Throw instead of return
      throw new Error('Failed to create admin user. Email might be taken.')
    }

    // 5. Create Profile & Link to Org
    if (authUser.user && org) {
       const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ // <--- CHANGED FROM insert TO upsert
          id: authUser.user.id,
          full_name: adminName,
          role: 'school_admin', // This will now overwrite 'student'
          organization_id: org.id
        })
      
      if (profileError) {
        console.error('Profile Error:', profileError)
        // Optional: Throw error if critical
      }
    }

    revalidatePath('/dashboard/admin/schools')
    redirect('/dashboard/admin/schools')
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/schools" className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Schools
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl shadow-gray-100">
        <div className="mb-8 border-b border-gray-100 pb-6">
           <h1 className="text-3xl font-black text-gray-900 mb-2">Onboard New School</h1>
           <p className="text-gray-500">Create the school entity and its primary administrator account.</p>
        </div>
        
        <form action={createSchool} className="space-y-6">
          
          {/* Section 1: School Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" /> School Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">School Name</label>
                <input name="name" type="text" placeholder="e.g. Springfield High" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Subdomain Slug</label>
                <input name="slug" type="text" placeholder="springfield" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-4" />

          {/* Section 2: Admin Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> Admin Credentials
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Admin Full Name</label>
              <input name="adminName" type="text" placeholder="Principal Skinner" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input name="email" type="email" placeholder="admin@school.com" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Set Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input name="password" type="text" placeholder="Secret123" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg font-medium">
              Note: You (Super Admin) are setting this password. Copy it now to send to the client.
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg mt-6">
            Create School & User
          </button>
        </form>
      </div>
    </div>
  )
}