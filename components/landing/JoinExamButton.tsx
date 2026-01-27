'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
  courseId: string
  label?: string
}

export default function JoinExamButton({ courseId, label = "Try Free Mock Test" }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleClick = async () => {
    setLoading(true)
    
    // 1. Check if user is currently logged in
    const { data: { user } } = await supabase.auth.getUser()
    
    // The destination URL where we want them to end up
    const targetUrl = `/courses/${courseId}`

    if (user) {
      // 2. User is ALREADY logged in -> Go straight to course
      router.push(targetUrl)
    } else {
      // 3. User is NOT logged in -> Go to Signup with a "next" parameter
      // We encodeURIComponent to ensure the slash / doesn't break the URL
      router.push(`/signup?next=${encodeURIComponent(targetUrl)}`)
    }
    
    // Note: We don't set loading(false) because we are navigating away
  }

  return (
    <button 
      onClick={handleClick}
      disabled={loading}
      className="bg-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {label}
    </button>
  )
}