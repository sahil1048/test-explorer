import BlogForm from '@/components/blogs/blog-form'
import { createClient } from '@/lib/supabase/server'

export default async function CreateBlogPage() {
  const supabase = await createClient()
  
  // 1. Fetch available tags
  const { data: tags } = await supabase.from('tags').select('name').order('name')
  
  // 2. Fetch Current Logged-in Admin
  const { data: { user } } = await supabase.auth.getUser()
  let currentUserProfile = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', user.id)
      .single()
    currentUserProfile = data
  }

  return (
    <BlogForm 
      availableTags={tags?.map(t => t.name) || []} 
      defaultAuthor={currentUserProfile} // Pass current user
    />
  )
}