import AssessmentWizard from '@/features/assessment-builder/components/assessment-wizard'
export default async function EditAssessmentPage({ params }: { params: Promise<{ assessmentId: string }> }) { return <AssessmentWizard assessmentId={(await params).assessmentId} /> }
