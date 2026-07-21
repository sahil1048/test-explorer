import QuestionEditor from '@/features/question-editor/components/question-editor'
import AssistPanel from '@/features/productivity/components/assist-panel'
const actions=[{key:'generate',label:'Generate draft'},{key:'rewrite',label:'Rewrite'},{key:'simplify',label:'Simplify language'},{key:'difficulty',label:'Adjust difficulty'},{key:'translate',label:'Translate'},{key:'explanation',label:'Draft explanation'},{key:'hints',label:'Draft hints'},{key:'distractors',label:'Suggest distractors'},{key:'duplicates',label:'Check duplicates'},{key:'quality',label:'Review quality'}]
export default function NewQuestionPage() { return <div className="space-y-5"><AssistPanel actions={actions}/><QuestionEditor /></div> }
