import BlogForm from '@/components/blogs/blog-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch Blog
  const { data: blog } = await supabase.from('blogs').select('*').eq('id', id).single()
  if (!blog) return notFound()

  // 2. Fetch Available Tags
  const { data: tags } = await supabase.from('tags').select('name').order('name')
  
  // 3. Fetch The Blog's Author (or fallback to current user if none)
  let authorProfile = null
  if (blog.author_id) {
     const { data } = await supabase.from('profiles').select('id, full_name').eq('id', blog.author_id).single()
     authorProfile = data
  } else {
     // Fallback: Current Admin
     const { data: { user } } = await supabase.auth.getUser()
     if (user) {
        const { data } = await supabase.from('profiles').select('id, full_name').eq('id', user.id).single()
        authorProfile = data
     }
  }

  return (
    <BlogForm 
      blog={blog} 
      availableTags={tags?.map(t => t.name) || []}
      defaultAuthor={authorProfile}
    />
  )
}