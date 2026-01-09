'use client'
import { createClient } from '@supabase/supabase-js' // Use raw client for Admin actions
import { redirect, useRouter } from 'next/navigation'
import { createSchoolAction } from '../actions'
import { ArrowLeft, Building2, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useState } from 'react'

export default function AddSchoolPage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(event.currentTarget)
    
    // Call the Server Action
    const result = await createSchoolAction(formData)
    setIsPending(false)

    if (result?.error) {
      // SERVER said there was an error, so CLIENT shows toast
      toast.error(result.error) 
    } else {
      toast.success('School created successfully!')
      router.push('/dashboard/admin/schools')
      router.refresh()
    }
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
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