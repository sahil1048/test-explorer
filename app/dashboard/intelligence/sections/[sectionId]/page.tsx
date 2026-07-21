import DimensionDrilldown from '@/features/intelligence/components/dimension-drilldown'
export default async function SectionIntelligencePage({params}:{params:Promise<{sectionId:string}>}){return <DimensionDrilldown kind="Section" id={(await params).sectionId}/>}
