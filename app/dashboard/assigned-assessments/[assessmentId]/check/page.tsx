import PreflightCheck from '@/features/student-assessment/components/preflight-check'
export default async function DeviceCheckPage({params}:{params:Promise<{assessmentId:string}>}){return <PreflightCheck assessmentId={(await params).assessmentId}/>}
