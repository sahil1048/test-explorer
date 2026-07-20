'use client'

import Link from 'next/link'
import { Bell, CheckCircle2, Info } from 'lucide-react'
import { useState } from 'react'
import { DUMMY_NOTIFICATIONS } from '@/lib/domain/notification'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS)
  const unreadCount = notifications.filter((notification) => !notification.read).length

  const markAllRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl p-0">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          <button type="button" onClick={markAllRead} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            Mark all read
          </button>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-96 overflow-y-auto p-2">
          {notifications.map((notification) => {
            const Icon = notification.tone === 'success' ? CheckCircle2 : Info
            const content = (
              <div className={`flex gap-3 rounded-xl p-3 transition hover:bg-gray-50 dark:hover:bg-white/5 ${notification.read ? '' : 'bg-blue-50/70 dark:bg-blue-500/10'}`}>
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-white/10">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{notification.title}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{notification.body}</p>
                  <p className="mt-1.5 text-[11px] font-medium text-gray-400">{notification.createdAt}</p>
                </div>
              </div>
            )

            return notification.actionUrl ? <Link key={notification.id} href={notification.actionUrl}>{content}</Link> : <div key={notification.id}>{content}</div>
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
