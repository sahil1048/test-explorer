import TemplatesView from '@/features/communication/components/templates-view'
import StaffCommunicationGuard from '@/features/communication/components/staff-guard'
export default function CommunicationTemplatesPage(){return <StaffCommunicationGuard><TemplatesView/></StaffCommunicationGuard>}
