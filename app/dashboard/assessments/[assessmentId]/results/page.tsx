import ResultsWorkspace from '@/features/evaluation/components/results-workspace'
export default async function AssessmentResultsPage({params}:{params:Promise<{assessmentId:string}>}){return <ResultsWorkspace assessmentId={(await params).assessmentId}/>}
