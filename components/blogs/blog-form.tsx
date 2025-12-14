'use client'

import { useState } from 'react'
import { createBlogAction, updateBlogAction } from '@/app/dashboard/admin/blogs/actions'
import { Save, ArrowLeft, Loader2, Upload, ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function BlogForm({ blog }: { blog?: any }) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!blog
  
  // Image Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(blog?.image_url || null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      if (isEdit) await updateBlogAction(formData)
      else await createBlogAction(formData)
      toast.success(isEdit ? 'Blog updated!' : 'Blog created!')
    } catch (e: any) {
      toast.error(e.message)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/blogs" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900">
            {isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Post
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        {isEdit && <input type="hidden" name="id" value={blog.id} />}

        {/* Title & Slug */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Blog Title</label>
            <input 
              name="title" 
              defaultValue={blog?.title} 
              required 
              placeholder="e.g. How to Study effectively"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Slug (URL)</label>
            <input 
              name="slug" 
              defaultValue={blog?.slug} 
              required 
              placeholder="e.g. how-to-study-effectively"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none font-mono text-sm"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
           <label className="block text-sm font-bold text-gray-900 mb-2">Tags (Comma Separated)</label>
           <input 
              name="tags" 
              defaultValue={blog?.tags?.join(', ')} 
              placeholder="Study Tips, Exam Prep, Math"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
            />
        </div>

        {/* Image Upload Field */}
        <div>
           <label className="block text-sm font-bold text-gray-900 mb-2">Cover Image</label>
           
           <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 transition-colors hover:bg-gray-50 hover:border-gray-300">
             <div className="flex flex-col md:flex-row items-center gap-6">
               
               {/* Preview Area */}
               <div className="w-full md:w-64 h-40 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 shrink-0 flex items-center justify-center group">
                 {previewUrl ? (
                   <>
                     <img 
                       src={previewUrl} 
                       alt="Preview" 
                       className="w-full h-full object-cover"
                     />
                     {/* Remove/Reset Button (Optional visual aid, logic handled by input) */}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Change Image</span>
                     </div>
                   </>
                 ) : (
                   <div className="text-center p-4">
                     <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                     <p className="text-xs text-gray-400">No image selected</p>
                   </div>
                 )}
               </div>

               {/* Upload Control */}
               <div className="flex-1 w-full">
                 <input 
                    type="file" 
                    name="image_file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-full file:border-0
                      file:text-xs file:font-bold
                      file:bg-black file:text-white
                      hover:file:bg-gray-800
                      cursor-pointer"
                 />
                 <p className="mt-2 text-xs text-gray-400">
                   {isEdit ? "Upload a new file to replace the current image. Leave empty to keep existing." : "Upload a cover image for your blog post."}
                 </p>
               </div>

             </div>
           </div>
        </div>

        {/* Excerpt */}
        <div>
           <label className="block text-sm font-bold text-gray-900 mb-2">Short Excerpt</label>
           <textarea 
              name="excerpt" 
              defaultValue={blog?.excerpt} 
              rows={3}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none resize-none"
            />
        </div>

        {/* Content */}
        <div>
           <label className="block text-sm font-bold text-gray-900 mb-2">Full Content (HTML Supported)</label>
           <textarea 
              name="content" 
              defaultValue={blog?.content} 
              rows={15}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none font-mono text-sm leading-relaxed"
            />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-8 pt-4 border-t border-gray-100">
           <div className="flex items-center gap-3">
             <input type="checkbox" name="is_featured" id="feat" defaultChecked={blog?.is_featured} className="w-5 h-5 accent-blue-600" />
             <label htmlFor="feat" className="font-bold text-gray-700">Featured Post</label>
           </div>
           <div className="flex items-center gap-3">
             <input type="checkbox" name="is_published" id="pub" defaultChecked={blog?.is_published ?? true} className="w-5 h-5 accent-green-600" />
             <label htmlFor="pub" className="font-bold text-gray-700">Published</label>
           </div>
        </div>

      </div>
    </form>
  )
}