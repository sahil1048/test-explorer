'use client'

import React from 'react'

export default function TableOfContents({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;

  // 1. Helper function to map text to your section IDs
  const getSectionId = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('highlight') || lower.includes('overview')) return 'overview';
    if (lower.includes('date')) return 'dates';
    if (lower.includes('eligib')) return 'eligibility';
    if (lower.includes('appli') || lower.includes('form') || lower.includes('correct')) return 'application';
    if (lower.includes('pattern') || lower.includes('mark')) return 'pattern';
    if (lower.includes('syllab')) return 'syllabus';
    if (lower.includes('prep') || lower.includes('book')) return 'preparation';
    if (lower.includes('admit') || lower.includes('card')) return 'admit-card';
    if (lower.includes('answer') || lower.includes('key')) return 'answer-key';
    if (lower.includes('result')) return 'results';
    if (lower.includes('cutoff')) return 'cutoffs';
    if (lower.includes('counsel')) return 'counselling';
    if (lower.includes('universit') || lower.includes('college')) return 'universities';
    if (lower.includes('faq')) return 'faqs';
    if (lower.includes('updat') || lower.includes('event')) return 'important-dates'; // Updates section
    return label.toLowerCase().replace(/[^a-z0-9]+/g, '-'); // Fallback
  };

  // 2. Smooth Scroll Handler
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    e.preventDefault();
    const targetId = getSectionId(label);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="border border-blue-200 rounded-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-[#2563EB] text-white px-4 py-2.5 text-sm font-medium">
         Table of Contents
      </div>
      
      {/* List Container */}
      <div className="bg-white flex flex-col">
         {/* First 5 Items */}
         {items.slice(0, 5).map((item, i) => (
            <a 
               key={i} 
               href={`#${getSectionId(item)}`}
               onClick={(e) => handleScroll(e, item)}
               className="block px-4 py-2.5 text-sm text-blue-600 border-b border-gray-100 hover:underline hover:bg-blue-50 transition-colors"
            >
               {item}
            </a>
         ))}
         
         {/* Remaining Items (Collapsible) */}
         {items.length > 5 && (
            <details className="group">
               <summary className="list-none cursor-pointer px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors select-none">
                  <span className="group-open:hidden flex items-center gap-1">
                     + {items.length - 5} View More
                  </span>
                  <span className="hidden group-open:block">
                     - View Less
                  </span>
               </summary>
               <div className="border-t border-gray-100">
                  {items.slice(5).map((item, i) => (
                     <a 
                        key={i} 
                        href={`#${getSectionId(item)}`}
                        onClick={(e) => handleScroll(e, item)}
                        className="block px-4 py-2.5 text-sm text-blue-600 border-b border-gray-100 hover:underline hover:bg-blue-50 transition-colors last:border-0"
                     >
                        {item}
                     </a>
                  ))}
               </div>
            </details>
         )}
      </div>
    </div>
  );
}