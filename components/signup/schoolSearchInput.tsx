'use client'
import { useState, useEffect, useRef } from 'react'
import { School, Plus, Lock } from 'lucide-react' // Added Lock icon
import { createClient } from '@/lib/supabase/client'

type SchoolOption = {
  id: string
  name: string
}

interface SchoolSearchInputProps {
  prefilledSchool?: SchoolOption | null
  readOnly?: boolean
}

export default function SchoolSearchInput({ prefilledSchool, readOnly = false }: SchoolSearchInputProps) {
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<SchoolOption[]>([])
  
  // Initialize with prefilled school if available
  const [selectedSchool, setSelectedSchool] = useState<SchoolOption | null>(prefilledSchool || null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Update if prop changes (e.g. initial load)
  useEffect(() => {
    if (prefilledSchool) {
      setSelectedSchool(prefilledSchool)
    }
  }, [prefilledSchool])

  // Fetch schools when user types (Only if NOT readOnly)
  useEffect(() => {
    if (readOnly) return; 

    const fetchSchools = async () => {
      if (query.length < 2) return
      
      const { data } = await supabase
        .from('organizations')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5)
      
      if (data) setOptions(data)
    }

    const timeoutId = setTimeout(fetchSchools, 300)
    return () => clearTimeout(timeoutId)
  }, [query, supabase, readOnly])

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
      
      {/* If ReadOnly (Subdomain), show label indicating it's fixed */}
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-bold text-gray-900">School / Institute</label>
        {readOnly && <span className="text-xs font-medium text-orange-600 flex items-center gap-1"><Lock className="w-3 h-3"/> Locked to Institute</span>}
      </div>
      
      <div className="relative">
        <input
          type="text"
          className={`w-full px-5 py-4 rounded-xl border-2 outline-none transition-all font-medium
            ${readOnly 
              ? 'bg-orange-50/50 border-orange-100 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-100 border-transparent focus:bg-white focus:border-orange-500 placeholder-gray-400'
            }`}
          placeholder={readOnly ? "" : "Search your school (Optional)..."}
          value={selectedSchool ? selectedSchool.name : query}
          onChange={(e) => {
            if (readOnly) return; // Prevent typing
            setQuery(e.target.value)
            setSelectedSchool(null)
            setIsOpen(true)
          }}
          onFocus={() => !readOnly && setIsOpen(true)}
          readOnly={readOnly}
          autoComplete="off"
        />
        
        {/* Dropdown Suggestions (Only if NOT readOnly) */}
        {!readOnly && isOpen && query.length > 0 && !selectedSchool && (
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
            ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                   No schools found. Leave blank if independent.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}