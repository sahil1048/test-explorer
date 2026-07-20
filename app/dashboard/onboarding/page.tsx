import OnboardingWizard from '@/components/onboarding/onboarding-wizard'

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const requestedStep = Number((await searchParams).step || 1)
  const initialStep = Number.isFinite(requestedStep) ? Math.min(7, Math.max(1, requestedStep)) : 1

  return <OnboardingWizard initialStep={initialStep} />
}
