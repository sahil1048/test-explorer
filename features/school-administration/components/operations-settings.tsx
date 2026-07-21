import Link from 'next/link'
import { Blocks, CreditCard, KeyRound, Palette, Shield, SlidersHorizontal } from 'lucide-react'

const sections = [
  {label:'School preferences',detail:'Timezone, language, working days and grading scheme.',href:'/dashboard/school-settings',icon:SlidersHorizontal},
  {label:'Branding',detail:'Logo, school name, colors, favicon and email identity.',href:'/dashboard/school-settings',icon:Palette},
  {label:'Subscription',detail:'Plan, renewal state and invoice history.',href:'#subscription',icon:CreditCard},
  {label:'License utilization',detail:'Student, teacher, invitation and storage allowances.',href:'#license',icon:KeyRound},
  {label:'Integrations',detail:'Google, Microsoft, API, webhooks and CSV sync.',href:'#integrations',icon:Blocks},
  {label:'Security',detail:'Sessions, devices, policies and security activity.',href:'#security',icon:Shield},
]
export function OperationsSettings(){return <div className="mx-auto max-w-5xl space-y-7"><div><p className="text-sm font-semibold text-blue-600">School administration</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Operations and billing</h1><p className="mt-2 text-slate-500">Tenant-specific commercial, integration and security controls.</p></div><div className="grid gap-4 md:grid-cols-2">{sections.map(({label,detail,href,icon:Icon})=><Link id={label.toLowerCase().split(' ')[0]} key={label} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300"><Icon className="h-5 w-5 text-slate-600"/><h2 className="mt-4 font-semibold text-slate-950">{label}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p></Link>)}</div><div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm text-slate-500">Usage and billing values will remain empty until the Phase 9 migration and provider repositories are connected.</div></div>}
