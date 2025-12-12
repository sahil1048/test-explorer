'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ArrowUpDown, Filter } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce' 

export default function StudentsFilter() {
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  // Update URL on search (Debounced)
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    replace(`?${params.toString()}`)
  }, 300)

  // Update URL on sort
  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', sortValue)
    replace(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          placeholder="Search by name..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('search')?.toString()}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Sort Dropdown */}
      <div className="relative">
        <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <select
          onChange={(e) => handleSort(e.target.value)}
          defaultValue={searchParams.get('sort') || 'newest'}
          className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black appearance-none cursor-pointer text-sm font-medium"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="school_asc">School Name (A-Z)</option>
          <option value="school_desc">School Name (Z-A)</option>
        </select>
      </div>

    </div>
  )
}