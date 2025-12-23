'use client'

import { useState, useRef, useEffect } from 'react'
import { createBlogAction, updateBlogAction } from '@/app/dashboard/admin/blogs/actions'
import { 
  Save, ArrowLeft, Loader2, ImageIcon, X, Plus, 
  ChevronDown, ChevronUp, Globe, Search, Share2, User
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

interface Props {
  blog?: any
  availableTags?: string[]
  defaultAuthor?: { id: string, full_name: string } | null
}

export default function BlogForm({ blog, availableTags = [], defaultAuthor }: Props) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!blog
  
  // Basic Info State
  const [title, setTitle] = useState(blog?.title || '')
  const [slug, setSlug] = useState(blog?.slug || '')
  const [content, setContent] = useState<string>(blog?.content || '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(blog?.image_url || null)
  const [selectedTags, setSelectedTags] = useState<string[]>(blog?.tags || [])
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // SEO State
  const [metaTitle, setMetaTitle] = useState(blog?.meta_title || '')
  const [metaDesc, setMetaDesc] = useState(blog?.meta_description || '')
  const [keywords, setKeywords] = useState<string[]>(blog?.keywords || [])
  const [keywordInput, setKeywordInput] = useState('')
  const [robots, setRobots] = useState(blog?.robots || 'index, follow')
  const [overrideCanonical, setOverrideCanonical] = useState(!!blog?.canonical_url && blog?.canonical_url !== `https://test-explorer.in/blogs/${blog?.slug}`)
  const [customCanonical, setCustomCanonical] = useState(blog?.canonical_url || '')

  // Social State
  const [ogTitle, setOgTitle] = useState(blog?.og_title || '')
  const [ogDesc, setOgDesc] = useState(blog?.og_description || '')
  const [ogPreviewUrl, setOgPreviewUrl] = useState<string | null>(blog?.og_image_url || null)

  // Author & Settings State
  const [authorId, setAuthorId] = useState(blog?.author_id || '')
  const [enableSchema, setEnableSchema] = useState(blog?.enable_structured_data ?? true)
  
  // Collapsible Sections
  const [isSeoOpen, setIsSeoOpen] = useState(false)
  
  // Auto-generate Slug from Title if creating new
  useEffect(() => {
    if (!isEdit && title) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }, [title, isEdit])

  // Helpers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (file) setUrl(URL.createObjectURL(file))
  }

  const handleKeywordAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (keywordInput.trim()) {
        setKeywords([...keywords, keywordInput.trim()])
        setKeywordInput('')
      }
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
    <form action={handleSubmit} className="max-w-5xl mx-auto pb-20 space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between sticky top-0   py-4 z-20 border-b border-gray-200 px-2">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/blogs" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900">
            {isEdit ? 'Edit Blog Post' : 'Create New Post'}
          </h1>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-black text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-black/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Post
        </button>
      </div>

      {/* 🟦 SECTION 1: BASIC BLOG INFO */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2 text-blue-600">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div> Basic Info
        </h2>
        
        {isEdit && <input type="hidden" name="id" value={blog.id} />}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Blog Title*</label>
              <input 
                name="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
                placeholder="e.g. How to Crack NEET 2024"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            {/* Slug */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Slug (URL)*</label>
              <div className="flex items-center px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 font-mono text-sm">
                 <span className="shrink-0">/blogs/</span>
                 <input 
                  name="slug" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required 
                  className="w-full bg-transparent outline-none text-black ml-1"
                />
              </div>
            </div>

            {/* --- RESTORED TAGS SELECTOR (Replacing Category) --- */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Tags / Category*</label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-800 text-sm font-bold rounded-full flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => toggleTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    type="button" 
                    onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                    className="px-3 py-1 border border-dashed border-gray-300 text-gray-500 text-sm font-medium rounded-full hover:border-black hover:text-black transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Tag
                  </button>

                  {isTagDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl z-50 max-h-48 overflow-y-auto p-1">
                      {availableTags.length === 0 ? (
                          <div className="p-2 text-xs text-gray-400 text-center">No tags available.</div>
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
              <input type="hidden" name="tags" value={selectedTags.join(',')} />
            </div>
            {/* ----------------------------------------------- */}
          </div>

          {/* Featured Image */}
          <div>
             <label className="block text-sm font-bold text-gray-900 mb-2">Featured Image*</label>
             <div className="h-full min-h-[240px] border-2 border-dashed border-gray-200 rounded-2xl p-4 transition-colors hover:bg-gray-50 hover:border-gray-300 flex flex-col items-center justify-center text-center relative overflow-hidden group">
               {previewUrl ? (
                 <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
               ) : (
                 <div className="z-10">
                   <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                   <p className="text-sm font-medium text-gray-500">Click to upload cover</p>
                   <p className="text-xs text-gray-400 mt-1">Rec: 1200x630px</p>
                 </div>
               )}
               <input 
                  type="file" 
                  name="image_file" 
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, setPreviewUrl)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
               />
             </div>
          </div>
        </div>

        <div>
           <label className="block text-sm font-bold text-gray-900 mb-2">Blog Content*</label>
           <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
             <ReactQuill 
                theme="snow"
                value={content}
                onChange={setContent}
                className="h-96 mb-12"
             />
           </div>
           <input type="hidden" name="content" value={content} />
        </div>
      </div>

      {/* 🟥 SECTION 2: SEO & META SETTINGS */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <button 
          type="button"
          onClick={() => setIsSeoOpen(!isSeoOpen)}
          className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 font-bold text-lg text-red-600">
            <Search className="w-5 h-5" /> SEO & Meta Settings
          </div>
          {isSeoOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </button>

        {isSeoOpen && (
          <div className="p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
            
            {/* 2.1 SEO Core */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">2.1 SEO Core</h3>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-gray-900">Meta Title*</label>
                  <span className={`text-xs font-mono ${metaTitle.length > 60 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {metaTitle.length} / 60
                  </span>
                </div>
                <input 
                  name="meta_title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Title appearing on Google Search"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold text-gray-900">Meta Description*</label>
                  <span className={`text-xs font-mono ${metaDesc.length > 160 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                    {metaDesc.length} / 160
                  </span>
                </div>
                <textarea 
                  name="meta_description"
                  value={metaDesc}
                  onChange={(e) => setMetaDesc(e.target.value)}
                  rows={3}
                  placeholder="Brief summary for search results..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Meta Keywords</label>
                <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-red-500">
                  {keywords.map((k, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-xs font-bold rounded-lg flex items-center gap-1">
                      {k} <button type="button" onClick={() => setKeywords(keywords.filter((_, idx) => idx !== i))}><X className="w-3 h-3 hover:text-red-500"/></button>
                    </span>
                  ))}
                  <input 
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordAdd}
                    placeholder="Add keyword + Enter"
                    className="flex-1 min-w-[120px] outline-none text-sm px-2"
                  />
                  <input type="hidden" name="keywords" value={keywords.join(',')} />
                </div>
              </div>
            </div>

            {/* 2.2 Indexing */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">2.2 Indexing Control</h3>
              <div className="max-w-xs">
                <label className="block text-sm font-bold text-gray-900 mb-2">Robots*</label>
                <div className="relative">
                  <select 
                    name="robots"
                    value={robots}
                    onChange={(e) => setRobots(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none appearance-none"
                  >
                    <option value="index, follow">index, follow (Default)</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 2.3 Canonical */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">2.3 Canonical URL</h3>
              <div className="space-y-3">
                 <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-600 break-all">
                    {`https://test-explorer.in/blogs/${slug}`}
                 </div>
                 
                 <div className="flex items-center gap-2">
                   <input 
                    type="checkbox" 
                    id="override_canon" 
                    checked={overrideCanonical}
                    onChange={(e) => setOverrideCanonical(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-red-600" 
                  />
                   <label htmlFor="override_canon" className="text-sm font-medium text-gray-700">Override Canonical URL (Advanced)</label>
                 </div>

                 {overrideCanonical && (
                   <input 
                     name="canonical_url"
                     value={customCanonical}
                     onChange={(e) => setCustomCanonical(e.target.value)}
                     placeholder="https://example.com/original-post"
                     className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none"
                   />
                 )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 🟪 SECTION 3: SOCIAL MEDIA PREVIEW */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
         <h2 className="text-lg font-bold flex items-center gap-2 text-purple-600">
           <Share2 className="w-5 h-5" /> Social Media Preview (OG)
         </h2>

         <div className="grid md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">OG Title</label>
                <input 
                  name="og_title"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  placeholder={metaTitle || title}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty to use Meta Title</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">OG Description</label>
                <textarea 
                  name="og_description"
                  value={ogDesc}
                  onChange={(e) => setOgDesc(e.target.value)}
                  rows={2}
                  placeholder={metaDesc}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                />
                 <p className="text-xs text-gray-400 mt-1">Leave empty to use Meta Description</p>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-900 mb-2">OG Image (Custom)</label>
                 <input 
                   type="file" 
                   name="og_image_file"
                   accept="image/*"
                   onChange={(e) => handleImageChange(e, setOgPreviewUrl)}
                   className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"
                 />
              </div>
            </div>

            {/* Preview Card */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Facebook/Twitter Preview</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50 max-w-sm">
                <div className="h-40 bg-gray-200 relative">
                  {(ogPreviewUrl || previewUrl) && (
                    <img src={ogPreviewUrl || previewUrl || ''} className="w-full h-full object-cover" alt="OG" />
                  )}
                </div>
                <div className="p-4 bg-gray-100 border-t border-gray-200">
                   <div className="text-xs text-gray-500 uppercase font-bold mb-1">TEST-EXPLORER.IN</div>
                   <div className="font-bold text-gray-900 leading-tight mb-1 truncate">{ogTitle || metaTitle || title || "Blog Title"}</div>
                   <div className="text-xs text-gray-600 line-clamp-2">{ogDesc || metaDesc || "Description will appear here..."}</div>
                </div>
              </div>
            </div>
         </div>
      </div>

      {/* 🟩 SECTION 4: AUTHOR & PUBLISHING */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
         <h2 className="text-lg font-bold flex items-center gap-2 text-green-600 mb-6">
           <User className="w-5 h-5" /> Author & Publishing
         </h2>
         
         <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Author</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={defaultAuthor?.full_name || 'Admin'} 
                  readOnly
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-medium outline-none cursor-not-allowed"
                />
                {/* Hidden Input to send ID to Server Action */}
                <input type="hidden" name="author_id" value={blog?.author_id || defaultAuthor?.id || ''} />
                
                <User className="absolute right-4 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Publish Date</label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm">
                {blog?.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Will be set on save'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Last Updated</label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm">
                {blog?.updated_at ? new Date(blog.updated_at).toLocaleDateString() : 'Will be set on save'}
              </div>
            </div>
         </div>

         <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
             <div className="flex items-center gap-3">
                <input type="checkbox" name="is_featured" id="feat" defaultChecked={blog?.is_featured} className="w-5 h-5 accent-black" />
                <label htmlFor="feat" className="font-medium text-gray-700">Featured Post</label>
             </div>
             <div className="flex items-center gap-3">
                <input type="checkbox" name="is_published" id="pub" defaultChecked={blog?.is_published ?? true} className="w-5 h-5 accent-black" />
                <label htmlFor="pub" className="font-medium text-gray-700">Published</label>
             </div>
         </div>
      </div>

      {/* 🟨 SECTION 5: STRUCTURED DATA */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-yellow-600">
           JSON-LD Structured Data
        </h2>
        
        <div className="flex items-center gap-2 mb-4">
           <input 
             type="checkbox" 
             name="enable_structured_data"
             id="schema_enable" 
             checked={enableSchema} 
             onChange={(e) => setEnableSchema(e.target.checked)}
             className="w-4 h-4 accent-yellow-600" 
            />
           <label htmlFor="schema_enable" className="text-sm font-medium text-gray-700">Enable Article Schema (Auto-generated)</label>
        </div>

        {enableSchema && (
          <pre className="bg-gray-900 text-gray-300 p-4 rounded-xl text-xs font-mono overflow-x-auto">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": metaTitle || title,
  "image": previewUrl ? [previewUrl] : [],
  "author": {
    "@type": "Person",
    "name": defaultAuthor || "Author Name"
  },
  "datePublished": blog?.created_at || new Date().toISOString(),
  "dateModified": new Date().toISOString()
}, null, 2)}
          </pre>
        )}
      </div>

      {/* 🧪 SECTION 6: SEO PREVIEW */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
         <h2 className="text-lg font-bold text-gray-900">Google SERP Preview</h2>
         <div className="bg-white p-4 max-w-xl">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs">🌐</div>
               <div>
                  <div className="text-xs text-gray-800">Test Explorer</div>
                  <div className="text-[10px] text-gray-500">https://test-explorer.in/blogs/{slug}</div>
               </div>
            </div>
            <div className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer mb-1 truncate">
               {metaTitle || title || "Your Blog Title Goes Here"}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">
               {new Date().toLocaleDateString()} — {metaDesc || "This is how your description will look on Google. Ensure key keywords are included early."}
            </div>
         </div>
      </div>

    </form>
  )
}