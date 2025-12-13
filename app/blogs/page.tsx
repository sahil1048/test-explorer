import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const posts = [
  {
    id: 1,
    category: "Study Tips",
    title: "How to crush your finals without burning out",
    date: "Dec 12, 2025",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: 2,
    category: "Tech",
    title: "Why we switched to Next.js for our exam engine",
    date: "Nov 28, 2025",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
    category: "Updates",
    title: "Introducing: Dark Mode for night owls",
    date: "Nov 15, 2025",
    color: "bg-green-100 text-green-700",
  },
];

export default function BlogsPage() {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-12 tracking-tight">
          The <span className="underline decoration-blue-500 decoration-4 underline-offset-4">Blog</span>
        </h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="group cursor-pointer flex flex-col h-full bg-gray-50 rounded-3xl p-6 hover:bg-gray-100 transition-colors"
            >
              <div className="mb-6 h-48 bg-white rounded-2xl w-full border border-gray-200 overflow-hidden relative">
                 {/* Image Placeholder */}
                 <div className="absolute inset-0 bg-gray-200 group-hover:scale-105 transition-transform duration-500" />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.color}`}>
                  {post.category}
                </span>
                <span className="text-xs text-gray-500 font-medium">{post.date}</span>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-auto group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
              
              <div className="mt-6 flex items-center text-sm font-bold text-gray-900">
                Read Article <ArrowUpRight className="w-4 h-4 ml-1" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}