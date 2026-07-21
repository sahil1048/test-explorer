import CommunicationComposer from '@/features/communication/components/composer'
import StaffCommunicationGuard from '@/features/communication/components/staff-guard'
export default function NewCommunicationPage(){return <StaffCommunicationGuard><CommunicationComposer/></StaffCommunicationGuard>}
