import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Construction } from 'lucide-react'

interface FoundationCard {
  title: string
  description: string
  href?: string
  icon: LucideIcon
  badge?: string
}

interface FoundationPageProps {
  eyebrow: string
  title: string
  description: string
  cards: FoundationCard[]
  action?: { label: string; href: string }
  notice?: string
}

export default function FoundationPage({ eyebrow, title, description, cards, action, notice }: FoundationPageProps) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {action && <Link href={action.href} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 dark:bg-white dark:text-gray-950">{action.label}<ArrowRight className="h-4 w-4" /></Link>}
      </header>

      {notice && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
          <Construction className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-5">{notice}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <div className="group h-full rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-white/10 dark:bg-gray-900 dark:hover:border-white/20">
              <div className="flex items-start justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gray-100 text-gray-600 transition group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-white/5 dark:text-gray-300 dark:group-hover:bg-blue-500/10 dark:group-hover:text-blue-300"><card.icon className="h-5 w-5" /></div>
                {card.badge && <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:bg-white/5 dark:text-gray-400">{card.badge}</span>}
              </div>
              <h2 className="mt-6 text-base font-semibold text-gray-950 dark:text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{card.description}</p>
              {card.href && <span className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">Open <ArrowRight className="h-3.5 w-3.5" /></span>}
            </div>
          )
          return card.href ? <Link key={card.title} href={card.href}>{content}</Link> : <div key={card.title}>{content}</div>
        })}
      </div>
    </div>
  )
}
