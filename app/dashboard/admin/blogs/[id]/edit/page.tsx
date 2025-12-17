import BlogForm from '@/components/blogs/blog-form'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch Blog
  const { data: blog } = await supabase.from('blogs').select('*').eq('id', id).single()
  if (!blog) return notFound()

  // Fetch Available Tags
  const { data: tags } = await supabase.from('tags').select('name').order('name')
  const availableTags = tags?.map(t => t.name) || []

  return <BlogForm blog={blog} availableTags={availableTags} />
}