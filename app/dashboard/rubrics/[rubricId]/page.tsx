import RubricEditor from '@/features/rubrics/components/rubric-editor'
export default async function EditRubricPage({params}:{params:Promise<{rubricId:string}>}){return <RubricEditor rubricId={(await params).rubricId}/>}
