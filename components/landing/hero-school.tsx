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
      
    </section>
  );
}