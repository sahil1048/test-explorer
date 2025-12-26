import { createClient } from '@/lib/supabase/server'
import ContentManager from '@/components/admin/content-manager'

export default async function ManageContentPage() {
  const supabase = await createClient()

  // --- CRITICAL: We must request 'subjects' nested inside 'courses' ---
  const { data: streams } = await supabase
    .from('categories')
    .select(`
      id, 
      title,
      description,
      icon_key,
      bg_color,
      order_index,
      courses (
        id, 
        title,
        description,
        is_published,
        subjects (
          id, 
          title
        )
      )
    `)
    .order('order_index', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      {/* @ts-ignore */}
      <ContentManager streams={streams || []} />
    </div>
  )
}