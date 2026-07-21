import type { ProductivityOperation } from './provider'
export interface OperationPolicy { maxInputTokens:number; maxOutputTokens:number; cacheable:boolean; requiresCitations:boolean; estimatedSecondsSaved:number }
const defaults:OperationPolicy={maxInputTokens:4000,maxOutputTokens:1200,cacheable:true,requiresCitations:false,estimatedSecondsSaved:180}
const evidenceOperations=new Set<ProductivityOperation>(['insight.class','insight.student_support','report.draft','grading.rubric_score','grading.rubric_gaps'])
export function getOperationPolicy(operation:ProductivityOperation):OperationPolicy{return {...defaults,requiresCitations:evidenceOperations.has(operation),cacheable:!operation.startsWith('grading.'),estimatedSecondsSaved:operation.startsWith('report.')?900:operation.startsWith('assessment.')?600:defaults.estimatedSecondsSaved}}
