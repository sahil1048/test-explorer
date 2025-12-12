'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ui/ImageUpload'
import { updateSchoolSettingsAction } from './actions'

interface SchoolSettingsFormProps {
  school: any
  organizationId: string
}

export default function SchoolSettingsForm({ school, organizationId }: SchoolSettingsFormProps) {
  const [logoUrl, setLogoUrl] = useState(school.logo_url || '')
  const [heroUrl, setHeroUrl] = useState(school.hero_image_url || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true)
    // Manually append the image URLs from state to the form data
    formData.set('logo_url', logoUrl)
    formData.set('hero_image_url', heroUrl)
    
    await updateSchoolSettingsAction(formData)
    setIsSaving(false)
    alert('Settings Saved Successfully!')
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <input type="hidden" name="organizationId" value={organizationId} />

      {/* Basic Info */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Information</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
            <input 
              name="name"
              type="text" 
              defaultValue={school.name}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
            <textarea 
              name="welcome_message"
              defaultValue={school.welcome_message}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
      </div>

      {/* Branding / Images */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding & Images</h3>
        <div className="grid md:grid-cols-2 gap-8">
            
            {/* Logo Upload */}
            <div>
              <ImageUpload 
                label="School Logo"
                value={logoUrl}
                onChange={setLogoUrl}
              />
              <p className="text-xs text-gray-500 mt-2">Recommended: 500x500px PNG</p>
            </div>

            {/* Hero Banner Upload */}
            <div>
              <ImageUpload 
                label="Hero/Cover Image"
                value={heroUrl}
                onChange={setHeroUrl}
              />
              <p className="text-xs text-gray-500 mt-2">Recommended: 1920x600px JPG</p>
            </div>

        </div>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={isSaving}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}