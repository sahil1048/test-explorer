import { OperationsSection } from '@/features/platform-operations/components/operations-section'
export default function Page(){return <OperationsSection title="Security operations" description="Investigate sessions, trusted devices, lockouts and security events." items={['active sessions','devices','critical events','2FA readiness and password-policy compliance']} />}
