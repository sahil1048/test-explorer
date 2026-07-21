import GradingWorkspace from '@/features/evaluation/components/grading-workspace'
import AssistPanel from '@/features/productivity/components/assist-panel'
export default async function GradeAttemptPage({params}:{params:Promise<{attemptId:string}>}){return <div className="space-y-5"><AssistPanel title="Grading assistance" actions={[{key:'rubric',label:'Suggest rubric score'},{key:'essay',label:'Draft evaluation'},{key:'feedback',label:'Suggest feedback'},{key:'gaps',label:'Highlight rubric gaps'}]}/><GradingWorkspace attemptId={(await params).attemptId}/></div>}
