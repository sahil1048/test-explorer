export type CommunicationEventType='assessment_assigned'|'assessment_due_soon'|'assessment_started'|'assessment_submitted'|'result_released'|'feedback_published'|'announcement_published'|'teacher_mention'|'academic_warning'|'system_maintenance'
export type DeliveryChannel='in_app'|'email'|'push'|'sms'
export interface DomainCommunicationEvent {id:string;organizationId:string;type:CommunicationEventType;source:{type:string;id?:string};payload:Record<string,unknown>;occurredAt:string}
export interface ResolvedMessage {title:string;body:string;actionUrl?:string;priority:'low'|'normal'|'high'|'urgent';metadata:Record<string,unknown>}
export interface DeliveryRecipient {id:string;userId:string;address?:string;locale:string}
export interface DeliveryResult {providerKey:string;providerMessageId?:string;status:'delivered'|'failed'|'suppressed';errorCode?:string}
