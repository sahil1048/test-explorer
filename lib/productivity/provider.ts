export type ProductivityOperation =
  | 'question.generate' | 'question.rewrite' | 'question.simplify' | 'question.difficulty' | 'question.translate'
  | 'question.explanation' | 'question.hints' | 'question.distractors' | 'question.quality' | 'question.duplicates'
  | 'assessment.draft' | 'assessment.balance' | 'assessment.variants' | 'assessment.recommendations' | 'assessment.coverage'
  | 'grading.rubric_score' | 'grading.feedback' | 'grading.rubric_gaps'
  | 'insight.class' | 'insight.student_support' | 'report.draft' | 'import.extract'

export interface GenerationContextRef { entityType:string; entityId:string; version?:number }
export interface GenerationRequest<TInput=unknown> { operation:ProductivityOperation; input:TInput; context:GenerationContextRef[]; promptKey:string; promptVersion:number; outputSchema:Record<string,unknown>; idempotencyKey:string }
export interface GenerationResult<TOutput=unknown> { providerKey:string; modelKey:string; output:TOutput; citations:GenerationContextRef[]; usage:{inputTokens:number;outputTokens:number;costMicros?:number}; latencyMs:number }
export interface ProviderCapabilities { structuredOutput:boolean; streaming:boolean; languages:string[]; maxContextTokens:number }
export interface GenerationProvider { readonly key:string; capabilities():ProviderCapabilities; generateStructured<TInput,TOutput>(request:GenerationRequest<TInput>,signal?:AbortSignal):Promise<GenerationResult<TOutput>>; streamText?(request:GenerationRequest,signal?:AbortSignal):AsyncIterable<string> }

export class GenerationProviderRegistry {
  private providers=new Map<string,GenerationProvider>()
  register(provider:GenerationProvider){if(this.providers.has(provider.key))throw new Error(`Provider already registered: ${provider.key}`);this.providers.set(provider.key,provider)}
  get(key:string){const provider=this.providers.get(key);if(!provider)throw new Error(`Productivity provider is not configured: ${key}`);return provider}
  available(){return [...this.providers.values()].map(provider=>({key:provider.key,capabilities:provider.capabilities()}))}
}
