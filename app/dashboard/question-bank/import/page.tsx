import ImportWizard from '@/features/question-import/components/import-wizard'
import AssistPanel from '@/features/productivity/components/assist-panel'
export default function QuestionImportPage() { return <div className="space-y-5"><AssistPanel title="Import assistance" actions={[{key:'extract',label:'Extract questions'},{key:'validate',label:'Validate structure'},{key:'duplicates',label:'Detect duplicates'},{key:'ocr',label:'OCR (coming later)'}]}/><ImportWizard /></div> }
