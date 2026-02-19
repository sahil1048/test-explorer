import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Quote, User } from 'lucide-react'
import CreateTestimonialForm from '@/components/testimonials/create-testimonial-form'
import DeleteTestimonialButton from '@/components/testimonials/delete-button'

// Helper function to handle Google Drive links
const getValidImageUrl = (url: string) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('drive.google.com')) {
      // Extract the File ID
      const pathMatch = urlObj.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
      const idParam = urlObj.searchParams.get('id');
      const fileId = pathMatch ? pathMatch[1] : idParam;
      
      if (fileId) {
        // Method 1: Google User Content Proxy (Best for bypassing cookie blocks)
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    }
  } catch (e) {
    console.error("Image URL parsing failed", e);
  }
  return url;
};

export default async function TestimonialsAdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.organization_id

  // Fetch existing testimonials for this school
  const { data: testimonials } = await supabase
    .from('school_testimonials')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Student Testimonials</h1>
        <p className="text-gray-500">Manage the reviews and success stories that appear on your school's landing page.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Add Form */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Quote className="w-5 h-5 text-blue-600" /> Add New Testimonial
            </h2>
            <CreateTestimonialForm />
          </div>
        </div>

        {/* RIGHT COLUMN: List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Published Testimonials ({testimonials?.length || 0})</h2>
          
          {(!testimonials || testimonials.length === 0) ? (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-medium bg-gray-50">
              No testimonials added yet. Fill out the form to add your first one!
            </div>
          ) : (
            testimonials.map((t) => {
              // PROCESS THE IMAGE URL HERE
              const processedImageUrl = getValidImageUrl(t.student_image);

              return (
                <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {processedImageUrl ? (
                      <img 
                        src={processedImageUrl} 
                        alt={t.student_name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="w-6 h-6 text-blue-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">{t.student_name}</h4>
                        <p className="text-xs font-bold text-blue-600 mb-2">{t.course_name}</p>
                      </div>
                      <DeleteTestimonialButton id={t.id} />
                    </div>
                    <p className="text-sm text-gray-600 italic">"{t.message}"</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  )
}