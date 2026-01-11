// components/complete-profile/complete-profile-form.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, User, Phone, GraduationCap, MapPin, Building2, ArrowRight, ChevronDown } from 'lucide-react'
import { completeProfileAction } from '@/app/complete-profile/actions'
import { State, City } from 'country-state-city'

export default function CompleteProfileForm({ profile }: { profile: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // State & City Logic
  const [selectedStateIso, setSelectedStateIso] = useState<string>(
    profile?.state 
      ? State.getStatesOfCountry('IN').find(s => s.name === profile.state)?.isoCode || '' 
      : ''
  )
  const [selectedCity, setSelectedCity] = useState<string>(profile?.city || '')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const stateName = State.getStateByCodeAndCountry(selectedStateIso, 'IN')?.name
    if (stateName) {
      formData.set('state', stateName)
    }

    const result = await completeProfileAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success("Profile setup complete! 🚀")
      router.push('/categories') 
      router.refresh()
    }
  }

  // --- Aesthetic Styles ---
  const labelStyle = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1"
  const inputWrapperStyle = "relative group transition-all duration-300 transform hover:-translate-y-0.5"
  const iconStyle = "absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300 w-5 h-5"
  const inputStyle = "w-full pl-14 pr-5 py-5 rounded-2xl bg-white/50 border-2 border-transparent focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-100/50 outline-none transition-all duration-300 font-bold text-gray-700 placeholder:text-gray-300 placeholder:font-medium text-lg shadow-sm hover:shadow-md"

  return (
    <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
      
      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className={labelStyle}>What should we call you?</label>
        <div className={inputWrapperStyle}>
          <User className={iconStyle} />
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            defaultValue={profile?.full_name || ''}
            placeholder="e.g. Alex Carter"
            className={inputStyle}
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className={labelStyle}>Mobile Number</label>
        <div className={inputWrapperStyle}>
          <Phone className={iconStyle} />
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={profile?.phone || profile?.phone_no || ''}
            placeholder="98765 43210"
            className={inputStyle}
          />
        </div>
      </div>

      {/* Stream Selection */}
      <div>
        <label htmlFor="stream" className={labelStyle}>Your Ambition</label>
        <div className={inputWrapperStyle}>
          <GraduationCap className={iconStyle} />
          <select
            id="stream"
            name="stream"
            required
            defaultValue={profile?.stream || ''}
            className={`${inputStyle} appearance-none cursor-pointer`}
          >
            <option value="" disabled>Select your stream</option>
            <option value="Non-Medical">Non-Medical (Engineering)</option>
            <option value="Medical">Medical (PCB)</option>
            <option value="Commerce">Commerce</option>
            <option value="Arts">Arts / Humanities</option>
            <option value="Foundation">Foundation (Class 9-10)</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-purple-500 transition-colors">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Location Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {/* State */}
        <div>
          <label className={labelStyle}>Region</label>
          <div className={inputWrapperStyle}>
            <MapPin className={iconStyle} />
            <select
              name="state_iso"
              required
              value={selectedStateIso}
              onChange={(e) => {
                setSelectedStateIso(e.target.value)
                setSelectedCity('')
              }}
              className={`${inputStyle} appearance-none cursor-pointer !text-base !py-4`}
            >
              <option value="" disabled>Select State</option>
              {State.getStatesOfCountry('IN').map((state) => (
                <option key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* City */}
        <div>
          <label className={labelStyle}>City</label>
          <div className={inputWrapperStyle}>
            <Building2 className={iconStyle} />
            <select
              name="city"
              required
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedStateIso}
              className={`${inputStyle} appearance-none cursor-pointer !text-base !py-4 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <option value="" disabled>Select City</option>
              {selectedStateIso && City.getCitiesOfState('IN', selectedStateIso).map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full group relative bg-black text-white font-bold text-xl py-5 rounded-2xl hover:bg-gray-900 active:scale-[0.98] transition-all duration-300 flex items-center justify-center shadow-2xl shadow-purple-200 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {/* Button Shine Effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <span className="flex items-center gap-3 relative z-10">
              Complete Profile <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </div>
    </form>
  )
}