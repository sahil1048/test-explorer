'use client'

import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function NotificationCenter() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <Bell className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl p-0">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-96 overflow-y-auto p-2">
          <div className="px-4 py-8 text-center"><Bell className="mx-auto h-5 w-5 text-gray-300"/><p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">No notifications</p><p className="mt-1 text-xs leading-5 text-gray-400">New assignments, feedback and school updates will appear here.</p></div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
