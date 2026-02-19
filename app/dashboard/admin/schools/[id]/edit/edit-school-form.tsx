'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'
import { updateSchoolAction } from '../../actions'

// UPDATED: Helper function to convert Google Drive links to direct image links
const getValidImageUrl = (url: string) => {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('drive.google.com')) {
      // Extract ID from format: /file/d/ID/... or /d/ID/...
      const pathMatch = urlObj.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/)
      const idParam = urlObj.searchParams.get('id')
      
      const fileId = pathMatch ? pathMatch[1] : idParam
      
      if (fileId) {
        // This is the new, reliable way to embed public Google Drive images
        return `https://lh3.googleusercontent.com/d/${fileId}`
      }
    }
  } catch (e) {
    // Return as-is if not a valid URL
  }
  return url
}

export default function EditSchoolForm({ school }: { school: any }) {
  const [isPending, setIsPending] = useState(false)
  const [currentImage, setCurrentImage] = useState(school.principal_image || '')
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(event.currentTarget)
    const result = await updateSchoolAction(formData)
    
    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('School updated successfully')
      router.push('/dashboard/admin/schools')
      router.refresh()
    }
    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={school.id} />

      {/* School Name */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">School Name</label>
        <input 
          name="name" 
          type="text" 
          defaultValue={school.name}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
        />
      </div>
      
      {/* Subdomain Slug */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Subdomain Slug</label>
        <div className="flex items-center">
          <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 text-gray-500 font-medium rounded-l-xl">
            testexplorer.in/
          </span>
          <input 
            name="slug" 
            type="text" 
            defaultValue={school.slug}
            required
            className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
          />
        </div>
        <p className="text-xs text-yellow-600 mt-2 font-medium">
          Warning: Changing this will break existing bookmarks for students.
        </p>
      </div>

      <div className="h-px bg-gray-100 my-6" />

      {/* Principal Message */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Principal Message</label>
        <textarea 
          name="principal_message" 
          defaultValue={school.principal_message}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
          placeholder="Message for the students..."
        />
      </div>

      {/* Principal Image */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Principal Image URL</label>
        {currentImage && (
          <div className="mb-3">
             <img 
               src={getValidImageUrl(currentImage)} 
               alt="Principal" 
               className="w-16 h-16 rounded-full object-cover border border-gray-200 bg-gray-50" 
               onError={(e) => {
                 // Fallback if the image URL is broken or private
                 (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Image+Error&background=f3f4f6&color=9ca3af'
               }}
             />
          </div>
        )}
        <input 
          name="principal_image" 
          type="text" 
          value={currentImage}
          onChange={(e) => setCurrentImage(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
          placeholder="https://example.com/principal.jpg or Google Drive Link"
        />
        <p className="text-xs text-gray-500 mt-2 font-medium">
          If using a Google Drive link, ensure the file is set to <strong>"Anyone with the link can view"</strong>.
        </p>
      </div>

      <div className="h-px bg-gray-100 my-6" />

      {/* Welcome Message */}
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Welcome Message</label>
        <textarea 
          name="welcome_message" 
          defaultValue={school.welcome_message}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
        />
      </div>

      <button type="submit" disabled={isPending} className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-70">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Changes
      </button>
    </form>
  )
}