"use client"; // Required for hover/scroll interaction

import Image from "next/image";
import { Bell } from "lucide-react";
import styles from "./marquee.module.css"; // Import the CSS we made above

export default function HeroSchool({ school }: { school: any }) {
  // Fallback hero image
  const heroImage = school.hero_image_url || "/images/placeholder-school.jpg";
  
  // Use real announcements if available, otherwise use mock data
  const announcementsData = school.announcements?.length > 0 
    ? school.announcements 
    : [
        { id: 1, title: "Final Term Math Mock Test is live", content: "All students from Class 12 must attempt this before Friday.", date: "Today", tag: "EXAM", color: "blue" },
        { id: 2, title: "School closed on Friday", content: "Holiday declared for Cultural Fest preparation.", date: "2d ago", tag: "HOLIDAY", color: "purple" },
        { id: 3, title: "Physics Assignment Due", content: "Chapter 4 assignment submission portal closes tonight.", date: "Yesterday", tag: "URGENT", color: "red" },
        { id: 4, title: "New Course Added", content: "Introduction to Python is now available in the library.", date: "1w ago", tag: "UPDATE", color: "green" },
      ];

  // Duplicate the list to ensure seamless infinite scrolling
  const scrollingList = [...announcementsData, ...announcementsData];

  return (
    <section className="relative min-h-[900px]  overflow-hidden py-0">
      
      {/* 1. Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt={`${school.name} Campus`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10 bg-blend-overlay" />
      </div>

      {/* 2. Content Container */}
      <div className=" w-full px-4 relative z-10 h-full py-12 flex flex-col justify-center">
        <div className="flex justify-end items-center h-full">

          {/* Right: Glassmorphism Notice Board */}
          <div className="w-full max-w-lg h-full">
            
            <div className="bg-white/90 backdrop-blur-lg rounded-[2.5rem] p-8 shadow-2xl shadow-black/10 border border-white/40 flex flex-col max-h-[800px]">
              
              {/* Header (Fixed) */}
              <div className="flex items-center gap-3 mb-6 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Bell className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Notice Board</h3>
                  <p className="text-sm text-gray-500 font-medium">Latest updates</p>
                </div>
              </div>

              {/* Scrolling Content Area */}
              <div className="relative overflow-hidden flex-1 h-[300px] -mx-2 px-2"> 
                
                {/* The Animated Wrapper */}
                <div className={styles.scrollContainer}>
                  {scrollingList.map((item, i) => (
                    <div 
                      key={`${item.id}-${i}`} 
                      className="group p-4 rounded-2xl bg-white/60 hover:bg-blue-50 transition-colors cursor-pointer border border-white/50 hover:border-blue-200 shadow-sm shrink-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 bg-white rounded-md text-[10px] font-bold text-gray-600 border border-gray-100 shadow-sm">
                          {item.tag || "NOTICE"}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          item.color === 'purple' ? 'text-purple-600 bg-purple-50' : 
                          item.color === 'red' ? 'text-red-600 bg-red-50' : 
                          'text-blue-600 bg-blue-50'
                        }`}>
                          {item.date || new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-gray-800 leading-tight mb-1">
                        {item.title}
                      </h4>
                      {item.content && (
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                          {item.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Fade Gradients for smooth top/bottom edges */}
                <div className="absolute top-0 left-0 right-0 h-6 bg-linear-to-b from-white/80 to-transparent z-10 pointer-events-none rounded-t-lg"/>
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-white/80 to-transparent z-10 pointer-events-none rounded-b-lg"/>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}