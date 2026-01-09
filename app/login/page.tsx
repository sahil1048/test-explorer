'use client'
import Link from 'next/link'
import { login } from '@/app/auth/actions'
import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner' // Import Toast
import { useRouter } from 'next/navigation' // Import Router

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // We can remove local error state and just use Toasts if preferred,
  // but keeping it for the inline alert doesn't hurt.
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    // Optional: Show a loading toast
    const toastId = toast.loading('Signing in...')
    
    const result = await login(formData)
    
    if (result && 'error' in result) {
      // Dismiss loading, show error
      toast.dismiss(toastId)
      toast.error(result.error || 'Login failed')
      setError(result.error || 'Login failed')
      setLoading(false)
    } else if (result && 'success' in result && result.redirectUrl) {
      toast.dismiss(toastId)
      toast.success('Welcome back! Redirecting...')
      router.push(result.redirectUrl)
      // Note: We don't set loading false here to prevent the UI 
      // from flashing back to "Log In" before the page changes.
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col lg:flex-row">
      {/* --- Left Side: Visuals --- */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <div className="absolute left-[-10%] w-[120%] h-[140%] bg-linear-to-br from-[#F4A261] to-[#E76F51] rounded-full -z-10 opacity-90 scale-90 translate-y-10" />
        
        <div className="relative z-10 w-[450px] mt-20">
          <Image 
            src="https://illustrations.popsy.co/amber/working-vacation.svg" 
            alt="Login Illustration" 
            width={500} 
            height={500}
            className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            priority
          />
          
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
          
          <div className="mb-10">
            <h1 className="text-5xl font-extrabold text-orange-600 mb-3 tracking-tight">Login</h1>
            <p className="text-gray-500 text-lg">Welcome back to you account.</p>
          </div>

          <form action={handleSubmit} className="space-y-6">
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

            <div>
              <Link 
                href="/forgot-password" 
                className="text-blue-600 font-bold hover:underline text-sm"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error Message (Kept as fallback/visual aid) */}
            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-bold text-lg py-4 rounded-full hover:bg-gray-900 transition-transform active:scale-[0.99] flex items-center justify-center shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Log In"}
            </button>

            <div className="flex items-center gap-3 justify-center">
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">Don't have an account?</span>
              <Link 
                  href="/signup" 
                  className="inline-block ml-2 text-orange-600 hover:text-orange-700 font-bold transition-colors"
                >
                  Sign Up →
              </Link>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  )
}