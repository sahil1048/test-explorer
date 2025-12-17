import BlogForm from '@/components/blogs/blog-form'
import { createClient } from '@/lib/supabase/server'

export default async function CreateBlogPage() {
  const supabase = await createClient()
  
  // Fetch available tags
  const { data: tags } = await supabase.from('tags').select('name').order('name')
  const availableTags = tags?.map(t => t.name) || []

  return <BlogForm availableTags={availableTags} />
}