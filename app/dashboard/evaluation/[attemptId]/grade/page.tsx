import GradingWorkspace from '@/features/evaluation/components/grading-workspace'
export default async function GradeAttemptPage({params}:{params:Promise<{attemptId:string}>}){return <GradingWorkspace attemptId={(await params).attemptId}/>}
