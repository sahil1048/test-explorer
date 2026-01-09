'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function parseTags(tagString: string): string[] {
  return tagString.split(',').map(t => t.trim()).filter(t => t.length > 0)
}

// Helper to upload file and return URL
async function uploadImage(file: File, supabase: any, bucket: string = 'blog-images'): Promise<string | null> {
  if (!file || file.size === 0) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${fileName}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) {
    console.error(`Upload failed: ${error.message}`)
    return null
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function createBlogAction(formData: FormData) {
  const supabase = await createClient()
  
  // Basic Info
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  // const excerpt = formData.get('excerpt') as string // Removed based on new wireframe requirements if strictly following, but good to keep as fallback
  const content = formData.get('content') as string
  const category_id = formData.get('category_id') as string
  const tags = parseTags(formData.get('tags') as string)
  const is_featured = formData.get('is_featured') === 'on'
  const is_published = formData.get('is_published') === 'on'

  // SEO & Meta
  const meta_title = formData.get('meta_title') as string
  const meta_description = formData.get('meta_description') as string
  const keywords = parseTags(formData.get('keywords') as string)
  const robots = formData.get('robots') as string
  const canonical_url = formData.get('canonical_url') as string
  
  // Social Media
  const og_title = formData.get('og_title') as string
  const og_description = formData.get('og_description') as string
  
  // Author & Settings
  const author_id = formData.get('author_id') as string
  const enable_structured_data = formData.get('enable_structured_data') === 'on'

  // Image Uploads
  const imageFile = formData.get('image_file') as File
  const ogImageFile = formData.get('og_image_file') as File
  
  let image_url = await uploadImage(imageFile, supabase)
  let og_image_url = await uploadImage(ogImageFile, supabase)

  // Default placeholder
  if (!image_url) {
    image_url = 'https://images.unsplash.com/photo-1499750310159-5b5f226932b7?auto=format&fit=crop&w=800&q=80' 
  }

  const { error } = await supabase.from('blogs').insert({
    title, slug, content, category_id, tags, is_featured, is_published,
    image_url,
    // SEO Fields
    meta_title, meta_description, keywords, robots, canonical_url,
    // OG Fields
    og_title, og_description, og_image_url,
    // Author
    author_id: author_id || null, // Handle empty string
    enable_structured_data
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/blogs')
  revalidatePath('/blogs')
  return { success: true }
}

export async function updateBlogAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  
  // Basic Info
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const category_id = formData.get('category_id') as string
  const tags = parseTags(formData.get('tags') as string)
  const is_featured = formData.get('is_featured') === 'on'
  const is_published = formData.get('is_published') === 'on'

  // SEO & Meta
  const meta_title = formData.get('meta_title') as string
  const meta_description = formData.get('meta_description') as string
  const keywords = parseTags(formData.get('keywords') as string)
  const robots = formData.get('robots') as string
  const canonical_url = formData.get('canonical_url') as string
  
  // Social Media
  const og_title = formData.get('og_title') as string
  const og_description = formData.get('og_description') as string
  
  // Author & Settings
  const author_id = formData.get('author_id') as string
  const enable_structured_data = formData.get('enable_structured_data') === 'on'

  // Handle Image Uploads
  const imageFile = formData.get('image_file') as File
  const ogImageFile = formData.get('og_image_file') as File
  
  const newImageUrl = await uploadImage(imageFile, supabase)
  const newOgImageUrl = await uploadImage(ogImageFile, supabase)

  const updateData: any = {
    title, slug, content, category_id, tags, is_featured, is_published,
    meta_title, meta_description, keywords, robots, canonical_url,
    og_title, og_description,
    author_id: author_id || null,
    enable_structured_data,
    updated_at: new Date().toISOString()
  }

  if (newImageUrl) updateData.image_url = newImageUrl
  if (newOgImageUrl) updateData.og_image_url = newOgImageUrl

  const { error } = await supabase.from('blogs').update(updateData).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/blogs')
  revalidatePath('/blogs')
  return { success: true }
}

export async function deleteBlogAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase.from('blogs').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/admin/blogs')
  revalidatePath('/blogs')
  return { success: true }
}