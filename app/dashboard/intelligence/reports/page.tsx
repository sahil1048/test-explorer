import ReportCatalog from '@/features/intelligence/components/report-catalog'
import AssistPanel from '@/features/productivity/components/assist-panel'
export default function ReportsPage(){return <div className="space-y-5"><AssistPanel title="Editable report drafts" actions={[{key:'parent',label:'Parent report draft'},{key:'principal',label:'Principal report draft'},{key:'reflection',label:'Teacher reflection'},{key:'assessment',label:'Assessment summary'},{key:'school',label:'School academic summary'}]}/><ReportCatalog/></div>}
