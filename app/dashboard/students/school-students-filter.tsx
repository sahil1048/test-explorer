'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ArrowUpDown } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce' 

export default function SchoolStudentsFilter() {
  const searchParams = useSearchParams()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    replace(`?${params.toString()}`)
  }, 300)

  const handleSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', sortValue)
    replace(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          placeholder="Search student name..."
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('search')?.toString()}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="relative">
        <ArrowUpDown className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <select
          onChange={(e) => handleSort(e.target.value)}
          defaultValue={searchParams.get('sort') || 'newest'}
          className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-sm font-medium"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
        </select>
      </div>
    </div>
  )
}