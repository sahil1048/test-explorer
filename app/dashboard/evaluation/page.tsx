import EvaluationQueue from '@/features/evaluation/components/evaluation-queue'
import AssistPanel from '@/features/productivity/components/assist-panel'
export default function EvaluationPage(){return <div className="space-y-5"><AssistPanel title="Evaluation productivity" actions={[{key:'reflection',label:'Draft teacher reflection'},{key:'summary',label:'Draft assessment summary'},{key:'templates',label:'Suggest comment templates'}]}/><EvaluationQueue/></div>}
