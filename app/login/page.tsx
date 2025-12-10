'use client'
import Link from 'next/link'
import { login } from '@/app/auth/actions'
import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col lg:flex-row">
      
      {/* --- Top Navigation (Absolute) --- */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20">
        {/* Logo */}
        <div className="flex items-center gap-2">
           {/* Replace with your actual Logo Image */}
           <div className="w-8 h-8 relative">
             <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
               <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#EA580C" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </div>
           <span className="text-xl font-bold text-gray-900">CUET-Test Explorer</span>
        </div>

        {/* Top Right Signup Button */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">Don't have an account?</span>
          <Link 
            href="/signup"
            className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* --- Left Side: Visuals (The Orange Blob) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        {/* The Big Orange Circle Background */}
        <div className="absolute left-[-10%] w-[120%] h-[140%] bg-gradient-to-br from-[#F4A261] to-[#E76F51] rounded-full -z-10 opacity-90 scale-90 translate-y-10" />
        
        <div className="relative z-10 w-[450px] mt-20">
          {/* Illustration: Person sitting on stool */}
          {/* You should replace this src with your actual uploaded image asset */}
          <Image 
            src="https://illustrations.popsy.co/amber/working-vacation.svg" 
            alt="Login Illustration" 
            width={500} 
            height={500}
            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            priority
          />
          
          {/* Decorative Floating UI Elements (Optional - Mimics the screenshot) */}
          <div className="absolute top-10 right-10 bg-white p-3 rounded-lg shadow-lg rotate-6 animate-pulse">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
               <div className="w-4 h-5 bg-blue-500 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-20 lg:py-0 mt-16 lg:mt-0">
        <div className="w-full max-w-md">
          
          <h1 className="text-4xl font-bold text-[#EA580C] mb-10">Login</h1>

          <form action={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                Enter your Email
              </label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full px-6 py-4 rounded-xl bg-[#C4C4C4] bg-opacity-40 text-gray-800 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                placeholder="Enter your Email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-base font-bold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="w-full px-6 py-4 rounded-xl bg-[#C4C4C4] bg-opacity-40 text-gray-800 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="Password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-[18px] text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div>
              <Link 
                href="/forgot-password" 
                className="text-blue-600 font-bold hover:underline text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-bold text-lg py-4 rounded-full hover:bg-gray-900 transition-transform active:scale-[0.99] flex items-center justify-center shadow-lg mt-4"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Log In"}
            </button>

            {/* Google Button */}
            <button 
              type="button"
              className="w-full bg-white border border-gray-200 text-gray-600 font-bold py-3.5 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 mt-4 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}