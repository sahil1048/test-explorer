'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function parseTags(tagString: string): string[] {
  return tagString.split(',').map(t => t.trim()).filter(t => t.length > 0)
}

// Helper to upload file and return URL
async function uploadImage(file: File, supabase: any): Promise<string | null> {
  if (!file || file.size === 0) return null

  // Sanitize filename: timestamp + original name (stripped of special chars)
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file)

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function createBlogAction(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const tags = parseTags(formData.get('tags') as string)
  const is_featured = formData.get('is_featured') === 'on'
  const is_published = formData.get('is_published') === 'on'
  
  // Handle Image Upload
  const imageFile = formData.get('image_file') as File
  let image_url = await uploadImage(imageFile, supabase)

  if (!image_url) {
    // Optional: Use a default placeholder if no image uploaded
    image_url = 'https://images.unsplash.com/photo-1499750310159-5b5f226932b7?auto=format&fit=crop&w=800&q=80' 
  }

  const { error } = await supabase.from('blogs').insert({
    title,
    slug,
    excerpt,
    content,
    image_url,
    tags,
    is_featured,
    is_published
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/blogs')
  revalidatePath('/blogs')
  redirect('/dashboard/admin/blogs')
}

export async function updateBlogAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const excerpt = formData.get('excerpt') as string
  const content = formData.get('content') as string
  const tags = parseTags(formData.get('tags') as string)
  const is_featured = formData.get('is_featured') === 'on'
  const is_published = formData.get('is_published') === 'on'

  // Handle Image Upload
  const imageFile = formData.get('image_file') as File
  const newImageUrl = await uploadImage(imageFile, supabase)

  // Prepare Update Object
  const updateData: any = {
    title,
    slug,
    excerpt,
    content,
    tags,
    is_featured,
    is_published,
    created_at: new Date().toISOString()
  }

  // Only update image_url if a new file was uploaded
  if (newImageUrl) {
    updateData.image_url = newImageUrl
  }

  const { error } = await supabase.from('blogs').update(updateData).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/blogs')
  revalidatePath('/blogs')
  redirect('/dashboard/admin/blogs')
}

export async function deleteBlogAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('blogs').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/admin/blogs')
  revalidatePath('/blogs')
}