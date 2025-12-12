'use client'

import { useState } from 'react'
import { signup } from '@/app/auth/actions'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface SignupFormProps {
  schoolSlug?: string
  schoolName?: string
}

export default function SignupForm({ schoolSlug, schoolName }: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    // The hidden input below ensures schoolSlug is already in formData.
    // We don't need to manually append it here anymore, but doing so 
    // as a fallback doesn't hurt.
    if (schoolSlug && !formData.get('schoolSlug')) {
      formData.append('schoolSlug', schoolSlug)
    }

    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
       
        <div className="text-center">
        <h2 className="mt-6 text-3xl font-black text-gray-900 tracking-tight">
          {schoolName ? `Join ${schoolName}` : 'Create Account'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Start your preparation journey today.
        </p>
      </div>

      <form action={handleSubmit} className="mt-8 space-y-4">
        
        {/* --- CRITICAL FIX: HIDDEN INPUT --- */}
        {/* This forces the schoolSlug into the FormData sent to the server */}
        <input type="hidden" name="schoolSlug" value={schoolSlug || ''} />
        {/* ---------------------------------- */}

        {/* ... Other inputs (FullName, Phone, Email, Password) remain the same ... */}
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
          <input name="fullName" type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="John Doe" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
          <input name="phone" type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="+91 98765 43210" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
          <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="you@example.com" />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
          <input name="password" type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="••••••••" />
        </div>

        {schoolName && (
           <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium text-center">
             You will be registered under <strong>{schoolName}</strong>
           </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
        </button>
      </form>

      {/* ... Footer link remains the same ... */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href={schoolSlug ? '/login' : '/login'} className="font-bold text-blue-600 hover:text-blue-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}