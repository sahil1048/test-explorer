import DimensionDrilldown from '@/features/intelligence/components/dimension-drilldown'
export default async function GradeIntelligencePage({params}:{params:Promise<{gradeId:string}>}){return <DimensionDrilldown kind="Grade" id={(await params).gradeId}/>}
