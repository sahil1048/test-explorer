import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react'
import { NewsletterWidget, RelatedArticles } from '@/components/blogs/blog-sidebar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Helper to format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

// Helper to extract H2 headings from HTML content for TOC
function extractHeadings(htmlContent: string) {
  const regex = /<h2[^>]*>(.*?)<\/h2>/g;
  const headings = [];
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    // Remove tags from the heading text if any inner tags exist
    const text = match[1].replace(/<[^>]*>?/gm, ''); 
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    headings.push({ text, id });
  }
  return headings;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params

  // 1. Fetch Blog Data
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!blog) return notFound()

  // 2. Fetch Related Articles (Exclude current one)
  const { data: relatedPosts } = await supabase
    .from('blogs')
    .select('id, title, slug, image_url, created_at')
    .neq('id', blog.id)
    .limit(4)
    .order('created_at', { ascending: false })

  // 3. Generate Table of Contents from HTML Content
  const toc = extractHeadings(blog.content || "");

  // 4. Inject IDs into Content for Anchor Links (Simple String Replacement)
  let processedContent = blog.content || "";
  toc.forEach(item => {
    // Basic replacement to add id attribute to h2 tags
    processedContent = processedContent.replace(
      `>${item.text}</h2>`, 
      ` id="${item.id}">${item.text}</h2>`
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-10">
      
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <Link href="/blogs" className="inline-flex items-center text-sm font-bold text-blue-600 hover:underline gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10">
        
        {/* --- MAIN CONTENT COLUMN (Left) --- */}
        <div className="lg:col-span-8">
          
          {/* Hero Section */}
          <div className="mb-8">
           
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              {blog.title}
            </h1>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium mb-8 border-b border-gray-200 pb-8">
               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" /> {formatDate(blog.created_at)}
               </div>
               <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4" /> 8 min read
               </div>
               <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-600 uppercase">
                    {blog.tags?.[0]}
                  </span>
               </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-3xl overflow-hidden bg-gray-100 mb-10 border border-gray-200 shadow-sm">
               <img 
                 src={blog.image_url || '/placeholder.jpg'} 
                 alt={blog.title}
                 className="w-full h-auto object-cover max-h-[500px]"
               />
            </div>
          </div>

          {/* Table of Contents Box */}
          {toc.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-8 mb-10 border border-gray-100">
               <h3 className="font-bold text-lg text-gray-900 mb-4">Table of Contents</h3>
               <ul className="space-y-3">
                 {toc.map((item, idx) => (
                   <li key={idx}>
                     <a href={`#${item.id}`} className="text-gray-600 hover:text-blue-600 hover:underline text-sm font-medium flex items-start gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                       {item.text}
                     </a>
                   </li>
                 ))}
               </ul>
            </div>
          )}

          {/* HTML Content (Rendered with Typography Styles) */}
          <article 
            className="prose prose-lg max-w-none 
              prose-headings:font-bold prose-headings:text-gray-900 
              prose-p:text-gray-600 prose-p:leading-relaxed 
              prose-li:text-gray-600 
              prose-strong:text-gray-900 
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-2xl prose-img:border prose-img:border-gray-100
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {/* FAQ Section */}
          {blog.faqs && Array.isArray(blog.faqs) && blog.faqs.length > 0 && (
            <div className="mt-16 pt-10 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
              <Accordion type="single" collapsible className="w-full">
                {blog.faqs.map((faq: any, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                    <AccordionTrigger className="text-left font-bold text-gray-900 hover:text-blue-600 hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 leading-relaxed pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Footer Meta: Tags & Share */}
          <div className="mt-12 py-8 border-y border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-gray-500 mr-2">Tags:</span>
                {blog.tags?.map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full hover:bg-gray-200 cursor-default transition-colors">
                    {t}
                  </span>
                ))}
             </div>
             
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                <Share2 className="w-4 h-4" /> Share Article
             </button>
          </div>

        </div>

        {/* --- SIDEBAR COLUMN (Right) --- */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <NewsletterWidget />
            <RelatedArticles articles={relatedPosts || []} />
          </div>
        </div>

      </div>
    </div>
  )
}