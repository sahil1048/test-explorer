'use client'
import { useState, useEffect, useRef } from 'react'
import { Check, ChevronsUpDown, School, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SchoolOption = {
  id: string
  name: string
}

export default function SchoolSearchInput() {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<SchoolOption[]>([])
  const [selectedSchool, setSelectedSchool] = useState<SchoolOption | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 1. Fetch schools when user types
  useEffect(() => {
    const fetchSchools = async () => {
      if (query.length < 2) return
      
      const { data } = await supabase
        .from('organizations')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5)
      
      if (data) setOptions(data)
    }

    const timeoutId = setTimeout(fetchSchools, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [query, supabase])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [wrapperRef])

  return (
    <div className="relative" ref={wrapperRef}>
      <input type="hidden" name="schoolId" value={selectedSchool?.id || ''} />
      <input type="hidden" name="manualSchoolName" value={!selectedSchool ? query : ''} />

      <label className="block text-sm font-bold text-gray-800 mb-1">School / Institute</label>
      
      <div className="relative">
        <input
          type="text"
          className="w-full px-5 py-3 rounded-xl bg-gray-200 border-transparent focus:bg-white focus:ring-2 focus:ring-orange-400 outline-none transition-all placeholder-gray-500"
          placeholder="Type your school name..."
          value={selectedSchool ? selectedSchool.name : query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedSchool(null) // Reset selection if typing
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
        
        {/* Dropdown Suggestions */}
        {isOpen && query.length > 0 && !selectedSchool && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-auto">
            {options.length > 0 ? (
              <>
                <div className="p-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Partner Schools
                </div>
                {options.map((school) => (
                  <button
                    key={school.id}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-3 transition-colors"
                    onClick={() => {
                      setSelectedSchool(school)
                      setIsOpen(false)
                    }}
                  >
                    <School className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-700 font-medium">{school.name}</span>
                  </button>
                ))}
              </>
            ) : null}

            {/* The "Other" Option */}
            <div className="border-t border-gray-100 p-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">
                Not listed?
              </div>
              <button
                type="button"
                className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
                onClick={() => {
                  // We just keep the query as the manual name and close dropdown
                  setIsOpen(false)
                }}
              >
                <Plus className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Use "{query}" as my school
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}