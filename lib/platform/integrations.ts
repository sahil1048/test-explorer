export type IntegrationKind = 'google_workspace' | 'microsoft_365' | 'rest_api' | 'webhook' | 'csv_sync' | 'sis'

export interface IntegrationContext { organizationId: string; integrationId: string; secretReference?: string }
export interface SyncResult { cursor?: string; created: number; updated: number; skipped: number; errors: string[] }

export interface IntegrationProvider {
  readonly kind: IntegrationKind
  connect(context: IntegrationContext, input: unknown): Promise<void>
  health(context: IntegrationContext): Promise<{ status: 'healthy' | 'degraded' | 'disconnected'; message?: string }>
  sync(context: IntegrationContext, cursor?: string): Promise<SyncResult>
  disconnect(context: IntegrationContext): Promise<void>
}

export class IntegrationRegistry {
  private providers = new Map<IntegrationKind, IntegrationProvider>()
  register(provider: IntegrationProvider) { this.providers.set(provider.kind, provider) }
  get(kind: IntegrationKind) { return this.providers.get(kind) }
}
