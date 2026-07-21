import DimensionDrilldown from '@/features/intelligence/components/dimension-drilldown'
export default async function SubjectIntelligencePage({params}:{params:Promise<{subjectId:string}>}){return <DimensionDrilldown kind="Subject" id={(await params).subjectId}/>}
