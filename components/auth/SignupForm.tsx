'use client'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { useState } from 'react'
import { Eye, EyeOff, Loader2, GraduationCap, MapPin, Building } from 'lucide-react'
import Image from 'next/image'
import SearchSchoolInput from '@/components/signup/schoolSearchInput'
import { toast } from "sonner"
import { State, City } from 'country-state-city'

interface SignupFormProps {
  school?: { id: string; name: string } | null
}

export default function SignupForm({ school }: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedStream, setSelectedStream] = useState<string>("") 
  const [selectedStateIso, setSelectedStateIso] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    if (!selectedStream) {
      toast.error('Please select your stream (Medical, Non-Medical, etc.)')
      setLoading(false)
      return
    }

    if (!selectedStateIso || !selectedCity) {
      toast.error('Please select your state and city')
      setLoading(false)
      return
    }

    const stateName = State.getStateByCodeAndCountry(selectedStateIso, 'IN')?.name || selectedStateIso

    formData.set('stream', selectedStream)
    formData.set('state', stateName)
    formData.set('city', selectedCity)
    
    if (school?.id && school.id !== 'undefined') {
      formData.set('schoolId', school.id)
    }


    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10">

        <div className="w-full max-w-md mx-auto order-2 lg:order-1">
          <div className="mb-10">
            <h1 className="text-5xl font-extrabold text-orange-600 mb-3 tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-lg">
              {school 
                ? `Join ${school.name} learning portal.` 
                : "Start your learning journey today."}
            </p>
          </div>

          <form action={handleSubmit} className="space-y-6">
            
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

            <div className="space-y-2">
                 <SearchSchoolInput 
                   prefilledSchool={school}
                   readOnly={!!school} 
                 />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Stream</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  name="stream"
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700"
                  required
                >
                  <option value="" disabled>Select your stream</option>
                  <option value="Non-Medical">Non-Medical (PCM)</option>
                  <option value="Medical">Medical (PCB)</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts / Humanities</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Contact Number</label>
              <input 
                name="phone" 
                type="text" 
                required 
                className="w-full px-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all placeholder-gray-400 font-medium"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">State</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <select
                    name="state"
                    value={selectedStateIso}
                    onChange={(e) => {
                      setSelectedStateIso(e.target.value);
                      setSelectedCity("");
                    }}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700 text-sm"
                    required
                  >
                    <option value="" disabled>Select State</option>
                    {State.getStatesOfCountry('IN').map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">City</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <select
                    name="city"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedStateIso}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="" disabled>Select City</option>
                    {selectedStateIso && City.getCitiesOfState('IN', selectedStateIso).map((city) => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

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

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100 flex items-center gap-2">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold text-lg py-4 rounded-full transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center shadow-xl shadow-orange-100 mt-6"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Account"}
            </button>

            
          </form>
        </div>

        <div className="hidden lg:flex flex-col justify-center items-center relative h-full min-h-[700px] order-1 lg:order-2">
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

           <div className="relative z-10 w-[500px] mt-20">
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