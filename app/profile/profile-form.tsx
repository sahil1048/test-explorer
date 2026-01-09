'use client'

import { useState } from 'react'
import { updateProfileAction } from './actions'
import { Save, Loader2, User, Phone, Mail, AlertCircle, CheckCircle2, MapPin, Building } from 'lucide-react'
import { toast } from "sonner"
import { State, City } from 'country-state-city'

export default function ProfileForm({ profile, email }: { profile: any, email?: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Derive initial state ISO from the saved state name so the dropdown pre-fills correctly
  const savedStateIso = State.getStatesOfCountry('IN').find(s => s.name === profile?.state)?.isoCode || ""
  const [selectedStateIso, setSelectedStateIso] = useState<string>(savedStateIso)
  const [selectedCity, setSelectedCity] = useState<string>(profile?.city || "")

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)

    const stateName = State.getStateByCodeAndCountry(selectedStateIso, 'IN')?.name || selectedStateIso
    
    formData.set('state', stateName)
    formData.set('city', selectedCity)
    
    const result = await updateProfileAction(formData)

    if (result?.error) {
      // REPLACED INLINE ERROR
      toast.error(result.error)
    } else {
      // REPLACED INLINE SUCCESS
      toast.success('Profile updated successfully!')
    }
    
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-xl">

      {/* Full Name */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            name="fullName" 
            defaultValue={profile?.full_name} 
            type="text" 
            required
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
          />
        </div>
      </div>

      {/* Email (Read Only) */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="email" 
            value={email} 
            disabled
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            name="phone" 
            defaultValue={profile?.phone || ''} 
            type="tel" 
            placeholder="+91..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
          />
        </div>
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

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

    </form>
  )
}