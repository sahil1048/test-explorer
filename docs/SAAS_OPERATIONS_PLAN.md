# Production SaaS Operations — Implementation Plan

## 1. Updated schema

The migration is additive. Existing `organizations`, `profiles`, `organization_invites`, `audit_events`, branding and settings remain canonical.

- Organization lifecycle: `organizations.lifecycle_status`, suspension metadata, billing email, language, working days and grading configuration.
- Commercial model: `subscription_plans`, `plan_entitlements`, `organization_subscriptions`, `billing_customers`, `invoices`, `payments`, `coupons`, `subscription_coupons`.
- License controls: `organization_licenses` stores purchased limits; usage is calculated from active profiles and pending invitations rather than copied counters.
- Entitlements: `feature_flags`, `plan_feature_flags`, `organization_feature_flags`, and gradual rollout percentage.
- Authorization: `custom_roles`, `role_permissions`, `profile_role_assignments`; existing system roles remain supported during migration.
- Operations: extended `audit_events`, `api_keys`, `api_usage_daily`, `integrations`, `webhook_endpoints`, `webhook_deliveries`, `security_events`, `user_devices`, `user_sessions`, `backup_policies`, `backup_runs`, `restore_requests`, `background_jobs`, `system_health_snapshots`.

## 2. Platform architecture

The platform control plane manages schools, subscriptions, entitlements, platform announcements and health. The tenant data plane contains academic and communication workloads. Both share Supabase, but every tenant table carries `organization_id` and tenant policies. Platform services use privileged server-side clients only after explicit super-admin authorization.

## 3. Multi-tenant strategy

- Shared-schema tenancy with mandatory `organization_id` foreign keys and RLS.
- `current_organization_id()` is the request tenant boundary; clients never choose an arbitrary tenant.
- Super-admin access is explicit and audited.
- Unique constraints include `organization_id` unless the record is deliberately global.
- Storage paths use `organizations/{organizationId}/...`; signed URLs remain short-lived.
- Background jobs persist tenant identity and re-authorize it before processing.
- Large enterprise tenants can later be moved behind the same repository contracts.

## 4. Billing architecture

`BillingService` owns customer, checkout, renewal, invoice and refund intents. `BillingProvider` adapters translate provider events into normalized webhook events. Provider IDs live only in billing records. Webhooks are signature-verified, idempotent and processed asynchronously. Subscription entitlements are calculated locally so application authorization never depends on a live gateway request.

## 5. Permission model

System roles (`super_admin`, `school_admin`, `teacher`, `student`, `parent`) provide safe defaults. Custom school roles contain permission groups and granular permission keys. Effective permissions are the union of active role assignments, bounded by organization and system-role restrictions. Subscription entitlements are evaluated separately from authorization: permission answers “may this user do it?”, entitlement answers “has this school purchased it?”.

## 6. Security architecture

Sessions and devices are inventory records backed by Supabase Auth sessions. Security events record login, lockout, password, permission, device and 2FA activity. Password and lockout policies are organization settings enforced server-side. Sensitive API keys and integration secrets store only hashes or encrypted references. Audit records are append-only to application users and include actor, organization, action, resource, request ID and optional IP/user agent.

## 7. Integration framework

`IntegrationProvider` adapters support Google Workspace, Microsoft 365, REST API, webhooks, CSV and future SIS connectors. Each connection has scopes, encrypted secret references, sync cursors and health state. Outbound webhooks use signed payloads, idempotency keys, retry schedules and a dead-letter state. Versioned `/api/v1` endpoints use API-key scopes, tenant-bound queries, cursor pagination and rate-limit contracts.

## 8. Component hierarchy

```text
PlatformOperations
├─ Operational KPIs
├─ School directory → School operations detail
├─ Subscription and license summaries
├─ Audit stream
├─ Feature flag controls
└─ System health / queue status

SchoolAdministration
├─ Profile and localization
├─ Branding / white label
├─ Grading and working days
├─ Subscription / license utilization
├─ Integrations
└─ Security and audit activity
```

## 9. Development checklist

### Operational foundation

- [x] Additive operational schema and tenant policies
- [x] Provider-neutral billing and integration contracts
- [x] Entitlement and permission vocabulary
- [x] Super-admin operations route and school directory shell
- [x] School subscription, security and integration settings shells
- [x] Versioned API response, pagination and rate-limit contracts
- [x] Honest health, usage and audit empty states
- [ ] Apply migration and regenerate Supabase types

### Persistence and enforcement

- [ ] Persist plan, subscription and invoice workflows
- [ ] Calculate and enforce seat/storage entitlements
- [ ] Add feature-flag evaluation repository and cache
- [ ] Add custom-role administration and effective-permission resolver
- [ ] Emit audit/security events from existing mutations and authentication
- [ ] Store session/device inventory and revoke sessions

### Providers and operations

- [ ] Payment provider adapter and signed webhook processor
- [ ] Email branding renderer and custom-domain verification
- [ ] Google/Microsoft OAuth connectors and CSV sync jobs
- [ ] API key issue/rotate/revoke flow and `/api/v1` resources
- [ ] Background worker, retry and dead-letter processing
- [ ] Error tracking, performance metrics and queue adapters
- [ ] Backup executor, exports and restore approval workflow

### Production hardening

- [ ] Cross-tenant authorization tests for every repository
- [ ] Rate-limit enforcement at edge and worker boundaries
- [ ] Secret manager integration and key rotation
- [ ] Audit retention, redaction and export policies
- [ ] Billing reconciliation and webhook replay procedures
- [ ] Incident response, restore drills and operational runbooks
