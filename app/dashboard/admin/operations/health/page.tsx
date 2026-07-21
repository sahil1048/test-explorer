import { OperationsSection } from '@/features/platform-operations/components/operations-section'
export default function Page(){return <OperationsSection title="System health" description="Monitor platform components, queues, failed jobs and integration health." items={['service health','queue depth','background jobs','webhook failures and performance signals']} />}
