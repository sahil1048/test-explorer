'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, GraduationCap, School, Upload, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const steps = ['School details', 'Academic year', 'Grades', 'Sections', 'Invite teachers', 'Import students', 'Finish']

export default function OnboardingWizard({ initialStep }: { initialStep: number }) {
  const router = useRouter()
  const [step, setStep] = useState(initialStep)
  const [grades, setGrades] = useState('Grade 1, Grade 2, Grade 3')
  const [sections, setSections] = useState('A, B')

  function move(next: number) {
    const safeStep = Math.min(7, Math.max(1, next))
    setStep(safeStep)
    router.replace(`/dashboard/onboarding?step=${safeStep}`, { scroll: false })
  }

  return (
    <div className="mx-auto max-w-5xl py-2 sm:py-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Organization setup</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">Set up your school workspace</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Create the academic foundation your teachers and students will share.</p>
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-gray-500 transition hover:text-gray-900 dark:hover:text-white">Save & exit</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border border-gray-200/80 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-gray-900">
          {steps.map((label, index) => {
            const number = index + 1
            const complete = number < step
            return (
              <button key={label} type="button" onClick={() => move(number)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${number === step ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${complete ? 'bg-emerald-100 text-emerald-700' : number === step ? 'bg-white/15 dark:bg-gray-950/10' : 'bg-gray-100 dark:bg-white/5'}`}>{complete ? <Check className="h-3.5 w-3.5" /> : number}</span>
                <span className="text-sm font-semibold">{label}</span>
              </button>
            )
          })}
        </aside>

        <main className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900 sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Step {step} of 7</span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(step / 7) * 100}%` }} /></div>
          </div>

          {step === 1 && <WizardSection icon={School} title="Tell us about your school" description="These details identify the organization across the workspace."><Field label="School name"><Input placeholder="Greenfield Public School" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="School code"><Input placeholder="GPS-2026" /></Field><Field label="Domain or subdomain"><Input placeholder="greenfield" /></Field></div><Field label="Address"><Input placeholder="School address" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Contact email"><Input type="email" placeholder="admin@school.edu" /></Field><Field label="Phone"><Input placeholder="+91" /></Field></div></WizardSection>}
          {step === 2 && <WizardSection icon={GraduationCap} title="Create the current academic year" description="Dates help keep promotions, sections, and future records correctly separated."><Field label="Academic year name"><Input placeholder="2026–27" defaultValue="2026–27" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Starts on"><Input type="date" /></Field><Field label="Ends on"><Input type="date" /></Field></div></WizardSection>}
          {step === 3 && <WizardSection icon={GraduationCap} title="Add grades" description="Enter the grades your school teaches. You can edit these later."><Field label="Grades (comma separated)"><Input value={grades} onChange={(event) => setGrades(event.target.value)} /></Field><Preview values={grades} empty="No grades added" /></WizardSection>}
          {step === 4 && <WizardSection icon={Users} title="Create sections" description="These sections will be created for each selected grade in the current year."><Field label="Sections (comma separated)"><Input value={sections} onChange={(event) => setSections(event.target.value)} /></Field><Preview values={sections} empty="No sections added" /><p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">Review grade-specific section assignments after setup if your school uses different sections by grade.</p></WizardSection>}
          {step === 5 && <WizardSection icon={UserPlus} title="Invite teachers" description="Send invitations now or continue and invite teachers from People later."><Field label="Teacher email addresses"><Input placeholder="teacher@school.edu, teacher2@school.edu" /></Field><p className="text-xs leading-5 text-gray-400">Invitations will use the Teacher role and remain pending until accepted.</p></WizardSection>}
          {step === 6 && <WizardSection icon={Upload} title="Import students" description="Bulk student import is reserved for the next incremental milestone."><div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-white/15"><Upload className="mx-auto h-6 w-6 text-gray-300" /><p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">CSV import is coming next</p><p className="mt-1 text-xs text-gray-400">Continue setup without adding dummy records.</p></div></WizardSection>}
          {step === 7 && <WizardSection icon={Check} title="Your foundation is ready to review" description="The workspace now has a clear structure for academics and people."><div className="grid gap-3 sm:grid-cols-2"><Summary label="Academic year" value="2026–27" /><Summary label="Grades" value={`${splitValues(grades).length} configured`} /><Summary label="Sections" value={`${splitValues(sections).length} templates`} /><Summary label="Student import" value="Skipped" /></div><p className="rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">This milestone establishes the complete onboarding experience. Database persistence will be connected after the Phase 1 migration is applied.</p></WizardSection>}

          <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-5 dark:border-white/10">
            <Button type="button" variant="ghost" onClick={() => move(step - 1)} disabled={step === 1}><ArrowLeft className="h-4 w-4" /> Back</Button>
            {step < 7 ? <Button type="button" onClick={() => move(step + 1)}>Continue <ArrowRight className="h-4 w-4" /></Button> : <Button asChild><Link href="/dashboard">Go to dashboard <ArrowRight className="h-4 w-4" /></Link></Button>}
          </div>
        </main>
      </div>
    </div>
  )
}

function WizardSection({ icon: Icon, title, description, children }: { icon: typeof School; title: string; description: string; children: React.ReactNode }) {
  return <section><div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><Icon className="h-5 w-5" /></div><h2 className="mt-5 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p><div className="mt-7 space-y-5">{children}</div></section>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-2"><span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</span>{children}</label> }
function splitValues(value: string) { return value.split(',').map((item) => item.trim()).filter(Boolean) }
function Preview({ values, empty }: { values: string; empty: string }) { const items = splitValues(values); return <div className="flex flex-wrap gap-2">{items.length ? items.map((item) => <span key={item} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:bg-white/5 dark:text-gray-300">{item}</span>) : <span className="text-xs text-gray-400">{empty}</span>}</div> }
function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5"><p className="text-xs text-gray-400">{label}</p><p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{value}</p></div> }
