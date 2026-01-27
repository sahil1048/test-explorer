'use client'

import { useState, useEffect } from 'react'

export default function ExamNavigationPills() {
  const [activeId, setActiveId] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Highlights' },
    { id: 'dates', label: 'Dates' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'application', label: 'Application' },
    { id: 'correction', label: 'Correction' },
    { id: 'pattern', label: 'Pattern' },
    { id: 'syllabus', label: 'Syllabus' },
    { id: 'preparation', label: 'Prep' },
    { id: 'admit-card', label: 'Admit Card' },
    { id: 'answer-key', label: 'Answer Key' },
    { id: 'results', label: 'Result' },
    { id: 'cutoffs', label: 'Cutoff' },
    { id: 'counselling', label: 'Counselling' },
    { id: 'universities', label: 'Universities' },
    { id: 'faqs', label: 'FAQs' },
  ]

  useEffect(() => {
    // This observer checks which section is currently crossing the "trigger line" on screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        // Root margin creates a "trigger zone" in the middle of the screen
        // -100px from top (to account for header)
        // -60% from bottom (so upcoming sections don't trigger too early)
        rootMargin: '-100px 0px -60% 0px', 
        threshold: 0
      }
    )

    tabs.forEach((tab) => {
      const element = document.getElementById(tab.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const handleScroll = (id: string) => {
    // Manually setting active ID immediately for better UX on click
    setActiveId(id)
    
    const element = document.getElementById(id)
    if (element) {
      // 140px offset accounts for Main Header + Sticky Nav
      const offset = 140 
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
       <div className="max-w-[90%] mx-auto px-4 flex items-center justify-center">
          <nav className="flex gap-3 overflow-x-auto no-scrollbar py-3 px-2">
             {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleScroll(tab.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200
                    ${activeId === tab.id 
                      ? 'bg-[#1e293b] text-white border-[#1e293b] shadow-md scale-105' 
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-white'}
                  `}
                >
                   {tab.label}
                </button>
             ))}
          </nav>
       </div>
    </div>
  )
}