import Link from 'next/link'
import { Activity, Building2, CreditCard, Flag, ScrollText, ShieldCheck, Users } from 'lucide-react'

const cards = [
  { label: 'Schools', description: 'Search, inspect, suspend or activate tenants.', href: '/dashboard/admin/schools', icon: Building2 },
  { label: 'Subscriptions', description: 'Plans, trials, renewals and license utilization.', href: '/dashboard/admin/operations/subscriptions', icon: CreditCard },
  { label: 'Feature flags', description: 'Global, plan and school-specific rollout controls.', href: '/dashboard/admin/operations/features', icon: Flag },
  { label: 'Audit logs', description: 'Trace security-sensitive and administrative actions.', href: '/dashboard/admin/operations/audit', icon: ScrollText },
  { label: 'System health', description: 'Queues, jobs, integrations and service health.', href: '/dashboard/admin/operations/health', icon: Activity },
  { label: 'Security', description: 'Sessions, devices, lockouts and security events.', href: '/dashboard/admin/operations/security', icon: ShieldCheck },
]

export function OperationsDashboard() {
  return <div className="mx-auto max-w-7xl space-y-8">
    <div><p className="text-sm font-semibold text-blue-600">Platform control plane</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">SaaS operations</h1><p className="mt-2 max-w-2xl text-slate-500">Operate schools, entitlements, security and platform services without entering tenant academic workflows.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(({label,description,href,icon:Icon}) => <Link key={label} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"><Icon className="h-5 w-5" /></div><h2 className="font-semibold text-slate-950">{label}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></Link>)}</div>
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><Users className="mx-auto h-6 w-6 text-slate-400"/><h2 className="mt-3 font-semibold text-slate-900">Operational metrics will appear after migration</h2><p className="mt-1 text-sm text-slate-500">No subscription, storage, API usage or health values are inferred.</p></div>
  </div>
}
