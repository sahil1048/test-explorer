"use client"; // Added to handle the category switching logic

import { useState } from "react";
import { Search, BookOpen, GraduationCap, Filter, ArrowUpRight, Clock, Users } from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState("All Subjects");

  const categories = ['All Subjects', 'Science', 'Commerce', 'Humanities', 'Competitive'];

  const subjects = [
    { id: "math", title: "Mathematics", count: "120+ Tests", icon: "Σ", color: "bg-blue-500", category: "Science" },
    { id: "physics", title: "Physics", count: "85+ Tests", icon: "Ω", color: "bg-indigo-500", category: "Science" },
    { id: "chemistry", title: "Chemistry", count: "90+ Tests", icon: "H₂", color: "bg-purple-500", category: "Science" },
    { id: "english", title: "English Lite.", count: "50+ Tests", icon: "Aa", color: "bg-amber-500", category: "Humanities" },
    { id: "history", title: "History", count: "40+ Tests", icon: "🏛", color: "bg-rose-500", category: "Humanities" },
    { id: "biology", title: "Biology", count: "110+ Tests", icon: "🧬", color: "bg-emerald-500", category: "Science" },
  ];

  // Logic to filter cards based on the sidebar selection
  const filteredSubjects = activeCategory === "All Subjects" 
    ? subjects 
    : subjects.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Section */}
      <section className="bg-slate-900 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
                <BookOpen className="w-4 h-4" /> Open Resource
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                Open <span className="text-blue-500">Library</span>
              </h1>
              <p className="text-slate-400 text-lg">
                Explore thousands of free mock tests curated by expert educators.
              </p>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search subjects..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Filters - Now Functional */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-wider mb-4">
                <Filter className="w-4 h-4" /> Categories
              </h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap w-full text-left px-5 py-3 rounded-2xl text-sm font-bold transition-all border ${
                      activeCategory === cat 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "bg-white border-slate-100 text-slate-600 hover:border-blue-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
              <GraduationCap className="w-8 h-8 mb-4 text-blue-400" />
              <h4 className="font-black text-lg leading-tight mb-2">School Portal</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">Access private exams assigned by your school.</p>
              <Link href="/login" className="block text-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-colors">
                Student Login
              </Link>
            </div>
          </aside>

          {/* Grid Area - Now links to actual categories */}
          <main className="flex-1">
            {filteredSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSubjects.map((sub) => (
                  <Link 
                    key={sub.id} 
                    href={`/categories?subject=${sub.id}`} // Links to your existing categories page
                    className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all relative overflow-hidden flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className={`w-14 h-14 ${sub.color} rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-inherit/20 group-hover:scale-110 transition-transform`}>
                        {sub.icon}
                      </div>
                      
                      <h3 className="text-xl font-black text-slate-900 mb-2">{sub.title}</h3>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold mb-6">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500" /> {sub.count}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span>Mock Tests</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sub.category}</span>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic">No subjects found in this category yet.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}