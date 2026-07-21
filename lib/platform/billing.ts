export type BillingEvent =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled'
  | 'invoice.paid'
  | 'invoice.failed'
  | 'refund.updated'

export interface BillingCustomerInput {
  organizationId: string
  name: string
  email: string
  taxId?: string
}

export interface BillingProvider {
  readonly key: string
  createCustomer(input: BillingCustomerInput): Promise<{ providerCustomerId: string }>
  createCheckout(input: { providerCustomerId: string; planKey: string; returnUrl: string }): Promise<{ url: string }>
  createPortalSession(input: { providerCustomerId: string; returnUrl: string }): Promise<{ url: string }>
  verifyWebhook(input: { body: string; signature: string }): Promise<{ id: string; type: BillingEvent; payload: unknown }>
}

export class BillingProviderRegistry {
  private providers = new Map<string, BillingProvider>()

  register(provider: BillingProvider) { this.providers.set(provider.key, provider) }
  require(key: string) {
    const provider = this.providers.get(key)
    if (!provider) throw new Error(`Billing provider is not configured: ${key}`)
    return provider
  }
}
