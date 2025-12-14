import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BlogForm from '@/components/blogs/blog-form'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single()

  if (!blog) return notFound()

  return <BlogForm blog={blog} />
}