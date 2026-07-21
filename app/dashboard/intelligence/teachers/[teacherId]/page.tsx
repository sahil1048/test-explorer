import DimensionDrilldown from '@/features/intelligence/components/dimension-drilldown'
export default async function TeacherIntelligencePage({params}:{params:Promise<{teacherId:string}>}){return <DimensionDrilldown kind="Teacher" id={(await params).teacherId}/>}
