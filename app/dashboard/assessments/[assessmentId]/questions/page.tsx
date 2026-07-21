import { redirect } from 'next/navigation'
export default async function AssessmentQuestionsPage({ params }: { params: Promise<{ assessmentId: string }> }) { redirect(`/dashboard/assessments/${(await params).assessmentId}/edit?step=3`) }
