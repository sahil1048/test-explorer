'use client'

import { useState } from 'react'
import { updateProfileAction } from './actions'
import { Save, Loader2, User, Phone, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ProfileForm({ profile, email }: { profile: any, email?: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setMessage(null)

    // Call the server action
    const result = await updateProfileAction(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }
    
    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-xl">
      
      {/* Feedback Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
          {message.text}
        </div>
      )}

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