'use client'

import { useState, useRef, useEffect } from 'react'
import { createBlogAction, updateBlogAction } from '@/app/dashboard/admin/blogs/actions'
import { Save, ArrowLeft, Loader2, ImageIcon, X, Plus } from 'lucide-react' // Added X, Plus
import Link from 'next/link'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

// Add availableTags prop
interface Props {
  blog?: any
  availableTags?: string[]
}

export default function BlogForm({ blog, availableTags = [] }: Props) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!blog
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(blog?.image_url || null)
  const [content, setContent] = useState<string>(blog?.content || '')

  // --- TAGS LOGIC ---
  const [selectedTags, setSelectedTags] = useState<string[]>(blog?.tags || [])
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }
  // ------------------

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

  // Quill Modules (Unchanged)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  }
  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link', 'image']

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

        {/* Title & Slug (Unchanged) */}
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

        {/* --- NEW TAGS SELECTOR --- */}
        <div>
           <label className="block text-sm font-bold text-gray-900 mb-2">Tags</label>
           
           {/* Visual Selected Tags */}
           <div className="flex flex-wrap gap-2 mb-3">
             {selectedTags.map(tag => (
               <span key={tag} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-800 text-sm font-bold rounded-full flex items-center gap-1">
                 {tag}
                 <button type="button" onClick={() => toggleTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
               </span>
             ))}
             
             {/* Add Button */}
             <div className="relative" ref={dropdownRef}>
               <button 
                 type="button" 
                 onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                 className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-full hover:border-black hover:text-black transition-colors flex items-center gap-1"
               >
                 <Plus className="w-3 h-3" /> Add Tag
               </button>

               {/* Dropdown */}
               {isTagDropdownOpen && (
                 <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl z-50 max-h-48 overflow-y-auto p-1">
                   {availableTags.length === 0 ? (
                      <div className="p-2 text-xs text-gray-400 text-center">No tags created.</div>
                   ) : (
                      availableTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => { toggleTag(tag); setIsTagDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 font-medium ${selectedTags.includes(tag) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                          disabled={selectedTags.includes(tag)}
                        >
                          {tag}
                        </button>
                      ))
                   )}
                   <Link href="/dashboard/admin/tags" className="block text-center p-2 text-xs text-blue-600 font-bold hover:underline border-t border-gray-100 mt-1">
                     + Manage Tags
                   </Link>
                 </div>
               )}
             </div>
           </div>

           {/* Hidden Input for Server Action (Sends comma separated string) */}
           <input type="hidden" name="tags" value={selectedTags.join(',')} />
        </div>
        {/* ------------------------- */}

        {/* Image Upload (Unchanged) */}
        <div>
           <label className="block text-sm font-bold text-gray-900 mb-2">Cover Image</label>
           <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 transition-colors hover:bg-gray-50 hover:border-gray-300">
             <div className="flex flex-col md:flex-row items-center gap-6">
               <div className="w-full md:w-64 h-40 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 shrink-0 flex items-center justify-center group">
                 {previewUrl ? (
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                 ) : (
                   <div className="text-center p-4">
                     <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                     <p className="text-xs text-gray-400">No image selected</p>
                   </div>
                 )}
               </div>
               <div className="flex-1 w-full">
                 <input 
                    type="file" 
                    name="image_file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer"
                 />
                 <p className="mt-2 text-xs text-gray-400">
                   {isEdit ? "Upload new to replace. Leave empty to keep." : "Upload a cover image."}
                 </p>
               </div>
             </div>
           </div>
        </div>

        {/* Excerpt (Unchanged) */}
        {/* <div>
           <label className="block text-sm font-bold text-gray-900 mb-2">Short Excerpt</label>
           <textarea 
              name="excerpt" 
              defaultValue={blog?.excerpt} 
              rows={3}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none resize-none"
            />
        </div> */}

        {/* Rich Text Editor (Unchanged) */}
        <div>
           <label className="block text-sm font-bold text-gray-900 mb-2">Full Content</label>
           <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
             <ReactQuill 
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="h-96 mb-12"
             />
           </div>
           <input type="hidden" name="content" value={content} />
        </div>

        {/* Toggles (Unchanged) */}
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