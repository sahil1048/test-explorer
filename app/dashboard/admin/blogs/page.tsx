import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit2, ExternalLink } from 'lucide-react'
import DeleteBlogButton from '@/components/blogs/delete-button'

export default async function AdminBlogsPage() {
  const supabase = await createClient()

  const { data: blogs } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Blog Management</h1>
          <p className="text-gray-500 font-medium">Create and manage content for the blog section.</p>
        </div>
        <Link 
          href="/dashboard/admin/blogs/create" 
          className="bg-black text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Create New
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Title</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Tags</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {blogs?.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900 line-clamp-1">{blog.title}</div>
                  <div className="text-xs text-gray-400 font-mono">/{blog.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {blog.is_published ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">Published</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-md">Draft</span>
                    )}
                    {blog.is_featured && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">Featured</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {blog.tags?.slice(0, 3).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded border border-gray-200">
                        {t}
                      </span>
                    ))}
                    {blog.tags?.length > 3 && <span className="text-xs text-gray-400">+{blog.tags.length - 3}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <Link 
                    href={`/blogs/${blog.slug}`} 
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Live"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link 
                    href={`/dashboard/admin/blogs/${blog.id}/edit`} 
                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  
                  {/* Replaced old form with the Client Component */}
                  <DeleteBlogButton blogId={blog.id} />
                  
                </td>
              </tr>
            ))}
            {(!blogs || blogs.length === 0) && (
               <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No blogs found.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}