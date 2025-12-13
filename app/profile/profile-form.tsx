'use client'

import { useState } from 'react'
import { updateProfileAction } from './actions'
import { Save, Loader2, User, Phone, Mail, AlertCircle, CheckCircle2, MapPin } from 'lucide-react'
import { toast } from "sonner"

export default function ProfileForm({ profile, email }: { profile: any, email?: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)

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

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <textarea 
            name="address" 
            defaultValue={profile?.address || ''} 
            placeholder="Enter your full address..."
            rows={3}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
          />
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