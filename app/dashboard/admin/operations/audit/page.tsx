import { OperationsSection } from '@/features/platform-operations/components/operations-section'
export default function Page(){return <OperationsSection title="Platform audit log" description="Trace administrative, billing, security and tenant lifecycle actions." items={['actor','action','resource','organization','request context and timestamp']} />}
