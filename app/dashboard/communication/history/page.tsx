import HistoryView from '@/features/communication/components/history-view'
import StaffCommunicationGuard from '@/features/communication/components/staff-guard'
export default function CommunicationHistoryPage(){return <StaffCommunicationGuard><HistoryView/></StaffCommunicationGuard>}
