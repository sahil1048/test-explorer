import Link from 'next/link'
import { Clock } from 'lucide-react'

// Mock Newsletter Component
export function NewsletterWidget() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
      <h3 className="font-bold text-gray-900 mb-2">Subscribe to Newsletter</h3>
      <p className="text-sm text-gray-500 mb-4">
        Get the latest CUET tips and strategies delivered to your inbox.
      </p>
      <div className="space-y-3">
        <input 
          type="email" 
          placeholder="Your email address" 
          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button className="w-full bg-[#0F172A] text-white font-bold py-3 rounded-lg text-sm hover:bg-gray-800 transition-colors">
          Subscribe
        </button>
      </div>
    </div>
  )
}

// Related Articles Component
export function RelatedArticles({ articles }: { articles: any[] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-6">Related Articles</h3>
      <div className="space-y-6">
        {articles.map((post) => (
          <Link key={post.id} href={`/blogs/${post.slug}`} className="flex gap-4 group">
            <div className="shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
               <img 
                 src={post.image_url || '/placeholder.jpg'} 
                 alt={post.title}
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               />
            </div>
            <div>
               <h4 className="text-sm font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                 {post.title}
               </h4>
               <span className="text-xs text-gray-400 flex items-center gap-1">
                 <Clock className="w-3 h-3" /> 5 min read
               </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}