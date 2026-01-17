'use client'

import { useState } from 'react'
import { Folder, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import MockTestCard from '@/components/admin/MockTestCard'
import DeleteCategoryButton from './DeleteCategoryButton'

interface CategoryAccordionProps {
  category: any
  mocks: any[]
}

export default function CategoryAccordion({ category, mocks }: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hasMocks = mocks.length > 0
  const mockIds = mocks.map(m => m.id)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      
      {/* 1. Header (Clickable) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 flex items-center justify-between cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-5">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${hasMocks ? 'bg-white text-blue-600 border-gray-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
             <Folder className="w-6 h-6" />
          </div>
          
          {/* Text Info */}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{category.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${hasMocks ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
                {mocks.length} Tests
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {isOpen ? 'Click to collapse' : 'Click to expand'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Delete Button (Stop Propagation so it doesn't toggle accordion) */}
          {hasMocks && (
            <div onClick={(e) => e.stopPropagation()}>
              <DeleteCategoryButton 
                mockIds={mockIds} 
                categoryName={category.title} 
              />
            </div>
          )}

          {/* Arrow Icon */}
          <div className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Collapsible Content */}
      {isOpen && (
        <div className="p-6 border-t border-gray-100 bg-white">
          {hasMocks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {mocks.map((mock) => (
                <MockTestCard key={mock.id} mock={mock} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
              <div className="text-center">
                <AlertCircle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm font-medium">No mock tests generated yet.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}