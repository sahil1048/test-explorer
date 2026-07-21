'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Expand, Globe2, MonitorSmartphone, Wifi, XCircle } from 'lucide-react'

export default function PreflightCheck({ assessmentId }: { assessmentId: string }) {
  const [online, setOnline] = useState(true)
  useEffect(() => { const update = () => setOnline(navigator.onLine); window.addEventListener('online', update); window.addEventListener('offline', update); return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) } }, [])
  const checks = [
    [Globe2, 'Browser compatibility', true, 'Your browser supports the required assessment features.'],
    [MonitorSmartphone, 'Screen size', true, 'Your screen is ready.'],
    [Wifi, 'Network connection', online, online ? 'You are connected.' : 'You can continue when your connection returns.'],
    [Expand, 'Fullscreen', true, 'Not required for this assessment.'],
  ] as const
  return <div className="mx-auto max-w-3xl space-y-6"><header><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Before you begin</p><h1 className="mt-3 text-3xl font-semibold">Device check</h1><p className="mt-2 text-sm text-gray-500">These checks are friendly warnings unless your teacher requires a specific setting.</p></header><section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900"><div className="space-y-3">{checks.map(([Icon,title,ok,detail])=><div key={title} className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-white/5"><Icon className="mt-0.5 h-5 w-5 text-gray-400"/><div className="flex-1"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-gray-400">{detail}</p></div>{ok?<CheckCircle2 className="h-5 w-5 text-emerald-500"/>:<XCircle className="h-5 w-5 text-amber-500"/>}</div>)}</div><div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">Once persistent delivery is enabled, starting creates an attempt before the first question opens. Refreshing or reconnecting resumes that same attempt.</div><label className="mt-5 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1"/><span>I have read the assessment instructions and understand the submission rules.</span></label><div className="mt-6 flex justify-end"><Link href={`/assessments/${assessmentId}/attempt/preview`} className="rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-gray-950">Start assessment</Link></div></section></div>
}
