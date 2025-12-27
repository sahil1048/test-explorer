'use client'

import { useState } from 'react'
import { Play, Loader2, CheckCircle } from 'lucide-react'
import { generateMockFromBlueprintAction } from '@/app/dashboard/admin/blueprints/actions'
import { toast } from 'sonner'

export default function GenerateButton({ blueprintId }: { blueprintId: string }) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    // Confirmation
    if (!confirm("Generate a new Mock Test from this blueprint?\nThis will create a new exam record shuffled from the pool.")) return

    setLoading(true)
    try {
      const result = await generateMockFromBlueprintAction(blueprintId)
      if (result.success) {
        toast.success(`Success! Generated mock with ${result.count} questions.`)
      }
    } catch (error: any) {
      toast.error(error.message || "Generation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleGenerate}
      disabled={loading}
      className="bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5 fill-current" /> Generate Mock
        </>
      )}
    </button>
  )
}