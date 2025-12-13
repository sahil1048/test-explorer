'use client'

import Link from 'next/link'
import { forgotPassword } from '@/app/auth/actions'
import { useState } from 'react'
import { Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setMessage(null)

    const result = await forgotPassword(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ 
        type: 'success', 
        text: 'Password reset link sent! Check your email inbox.' 
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="w-full max-w-md">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success State */}
        {message?.type === 'success' ? (
          <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Check your inbox</h3>
            <p className="text-gray-600 mb-6 text-sm">
              We have sent a password reset link to your email address.
            </p>
            <Link 
              href="/login"
              className="block w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          /* Input Form */
          <form action={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-gray-50 focus:bg-white" 
                />
              </div>
            </div>

            {message?.type === 'error' && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                {message.text}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-900 transition-transform active:scale-[0.99] flex items-center justify-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}