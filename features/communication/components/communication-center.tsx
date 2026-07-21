'use client'

import Link from 'next/link'
import { Bell, CalendarDays, History, Megaphone, Plus, Search, Settings, TextQuote } from 'lucide-react'
import { useState } from 'react'

const types = ['All', 'Announcements', 'Notifications', 'Reminders', 'Academic updates', 'System', 'Results', 'Assessments', 'Events']

export default function CommunicationCenter({ canManage }: { canManage: boolean }) {
  const [type, setType] = useState('All')

  return <div className="space-y-7">
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Contextual updates</p><h1 className="mt-3 text-3xl font-semibold">Communication</h1><p className="mt-2 text-sm text-gray-500">Academic messages and platform events—not open-ended chat.</p></div>
      {canManage && <Link href="/dashboard/communication/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white dark:bg-white dark:text-gray-950"><Plus className="h-4 w-4"/>New communication</Link>}
    </header>
    <div className={`grid gap-3 sm:grid-cols-2 ${canManage ? 'xl:grid-cols-4' : ''}`}>
      <Shortcut href="/dashboard/communication/calendar" icon={CalendarDays} label="Calendar"/>
      {canManage && <Shortcut href="/dashboard/communication/templates" icon={TextQuote} label="Templates"/>}
      {canManage && <Shortcut href="/dashboard/communication/history" icon={History} label="Delivery history"/>}
      <Shortcut href="/dashboard/communication/preferences" icon={Settings} label="Preferences"/>
    </div>
    <div className="rounded-3xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900">
      <label className="relative block"><span className="sr-only">Search communication</span><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/><input className="editor-input pl-9" placeholder="Search updates by title or date…"/></label>
      <div className="mt-3 flex gap-1 overflow-x-auto" aria-label="Communication type">{types.map((item) => <button type="button" key={item} aria-pressed={type === item} onClick={() => setType(item)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold ${type === item ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950' : 'text-gray-500'}`}>{item}</button>)}</div>
    </div>
    <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-white/15 dark:bg-gray-900"><Bell className="mx-auto h-7 w-7 text-gray-300"/><h2 className="mt-4 font-semibold">No updates yet</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">Announcements, assessment reminders, released results, feedback and school events will appear here when they are published for you.</p></div>
  </div>
}

function Shortcut({ href, icon: Icon, label }: { href: string; icon: typeof Megaphone; label: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-gray-900"><Icon className="h-4 w-4 text-gray-400"/>{label}</Link>
}
