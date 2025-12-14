import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import BlogFilters, { BlogTags } from "@/components/blogs/blog-filters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const revalidate = 60;

// Helper to format date like "26-03-2025"
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; tag?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const tag = params.tag || "";
  const itemsPerPage = 6;

  // 1. Fetch Featured Blogs
  const { data: featuredBlogs } = await supabase
    .from("blogs")
    .select("*")
    .eq("is_featured", true)
    .limit(2)
    .order("created_at", { ascending: false });

  // 2. Build Query for All Articles
  let query = supabase
    .from("blogs")
    .select("*", { count: "exact" })
    .eq("is_featured", false)
    .order("created_at", { ascending: false });

  if (search) query = query.ilike("title", `%${search}%`);
  if (tag) query = query.contains("tags", [tag]);

  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;
  
  const { data: blogs, count } = await query.range(from, to);
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* --- SECTION 1: FEATURED ARTICLES --- */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Featured Articles</h2>
            <Link href="#all-articles" className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
              View All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredBlogs?.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                {/* Image Area */}
                <div className="relative h-64 bg-gray-200 w-full">
                  <img 
                    src={post.image_url || '/placeholder.jpg'} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Category Badge Overlay */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                      {post.tags?.[0] || 'General'}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Meta Data */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.created_at)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      8 min read {/* Mock data for UI match */}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>

                  <div>
                    <Link 
                      href={`/blogs/${post.slug}`} 
                      className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: ALL ARTICLES --- */}
        <div id="all-articles" className="scroll-mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Articles</h2>
          
          {/* Search Bar (Full Width like Screenshot 3) */}
          <div className="mb-10">
            <BlogFilters />
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs?.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No articles found matching your search.</p>
              </div>
            ) : (
              blogs?.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                  
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                    <img 
                       src={post.image_url || '/placeholder.jpg'} 
                       alt={post.title}
                       className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                        {post.tags?.[0] || 'Article'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(post.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 5 min read
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-5 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <div>
                      <Link 
                        href={`/blogs/${post.slug}`} 
                        className="inline-flex items-center justify-center px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- SECTION 3: PAGINATION & CATEGORIES --- */}
        <div className="space-y-12">
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href={`?page=${Math.max(1, page - 1)}&search=${search}&tag=${tag}#all-articles`} 
                      className={page === 1 ? "pointer-events-none opacity-50" : "bg-white border border-gray-200 hover:bg-gray-50"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href={`?page=${i + 1}&search=${search}&tag=${tag}#all-articles`}
                        isActive={page === i + 1}
                        className={page === i + 1 ? "bg-black text-white hover:bg-gray-800" : "bg-white border border-gray-200 hover:bg-gray-50"}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      href={`?page=${Math.min(totalPages, page + 1)}&search=${search}&tag=${tag}#all-articles`} 
                      className={page === totalPages ? "pointer-events-none opacity-50" : "bg-white border border-gray-200 hover:bg-gray-50"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Popular Categories (Matching Screenshot 2) */}
          <div className="border-t border-gray-200 pt-10">
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Popular Categories</h3>
            </div>
            
            {/* We pass the 'activeTag' to highlight the selected one */}
            <BlogTags activeTag={tag} />
          </div>

        </div>

      </div>
    </div>
  );
}