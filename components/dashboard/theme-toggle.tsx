'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
    >
      {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
