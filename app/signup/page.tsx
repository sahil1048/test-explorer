'use client'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
// Ensure this path is correct for your project structure
import SearchSchoolInput from '@/components/signup/schoolSearchInput'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    // Main container with overflow hidden to contain the blob
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10">

        {/* --- Left Side - Form --- */}
        {/* Order-2 on mobile, Order-1 on desktop to be on the left */}
        <div className="w-full max-w-md mx-auto order-2 lg:order-1">
          <div className="mb-10">
            <h1 className="text-5xl font-extrabold text-orange-600 mb-3 tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-lg">Start your learning journey today.</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
              <input 
                name="fullName" 
                type="text" 
                required 
                className="w-full px-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all placeholder-gray-400 font-medium"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full px-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all placeholder-gray-400 font-medium"
                placeholder="john@example.com"
              />
            </div>

            {/* Custom School Search Input Component */}
            {/* Ensure your component's internal styling matches these inputs (bg-gray-100, border-2, etc.) */}
            <div className="space-y-2">
                 <SearchSchoolInput />
            </div>

            {/* Contact Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Contact Number</label>
              <input 
                name="phone" 
                type="tel" 
                required 
                className="w-full px-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all placeholder-gray-400 font-medium"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full px-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all placeholder-gray-400 font-medium pr-12"
                placeholder="Min. 8 characters"
              />
               <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold text-lg py-4 rounded-full transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center shadow-xl shadow-orange-100 mt-6"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Account"}
            </button>

            {/* Google Button */}
            <div className="text-center pt-2">
               <button 
                type="button"
                className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>
            </div>
          </form>
        </div>

        {/* --- Right Side - Visuals --- */}
        {/* Order-1 on mobile (hidden), Order-2 on desktop to be on the right */}
        <div className="hidden lg:flex flex-col justify-center items-center relative h-full min-h-[700px] order-1 lg:order-2">

           {/* Top Right Login Link */}
           <div className="absolute top-0 right-0 p-6 z-20">
              <p className="text-base font-semibold text-gray-700">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="inline-block ml-2 text-orange-600 hover:text-orange-700 font-bold transition-colors"
                >
                  Log In →
                </Link>
              </p>
           </div>

           {/* The Complex Orange Blob Background */}

           <div className="relative z-10 w-[500px] mt-20">
             {/* Signup Illustration - Using a vibrant one from Popsy */}
             <Image 
               src="https://illustrations.popsy.co/amber/creative-work.svg" 
               alt="Signup Illustration" 
               width={500} 
               height={500}
               className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
               priority
             />
           </div>
        </div>
      </div>
    </div>
  )
}