# Test Explorer Security, Performance, Scalability and Reliability Audit

Audit date: 2026-07-21

## Executive Summary

**Production verdict: do not process real school or student data.**

The application has improved privileged admin authorization and currently has no high/critical npm audit findings, but major controls remain incomplete. Public registration accepts a client-selected organization, school settings trust a client-provided tenant ID, legacy RLS cannot be verified from repository migrations, rich HTML is rendered without an identified sanitizer, uploads are public and weakly validated, and there is no application rate limiting. The school assessment player simulates autosave and submission rather than providing recovery or idempotency.

Performance and scalability cannot be certified because there are no load tests, traces, query plans, database metrics or bundle budgets. Static evidence shows 45 broad `select('*')` calls, only one `.range()` pagination call, request-time aggregates, large client components and no active background workers. Reliability is the weakest category: critical workflows lack transactions, retries, conflict handling and durable state.

## Scores

| Area | Score | Release status |
|---|---:|---|
| Security | 2.5/10 | Blocked |
| Performance | 3/10 | Unmeasured and high risk |
| Scalability | 2/10 | Not ready beyond controlled development data |
| Reliability | 1.5/10 | Critical workflows are not durable |

## Security Architecture Map

```text
Supabase Auth
├─ Password login/signup
├─ Cookie-backed server session and refresh in middleware
├─ Email password-reset link
└─ Admin API through server-only service-role client

Authorization
├─ Shared dashboard role guard
├─ Action-level super-admin guard for legacy admin mutations
├─ Repeated action-specific user/profile checks elsewhere
├─ RLS for newer phase tables
└─ Unknown RLS for legacy schema tables

Tenant context
├─ profiles.organization_id
├─ organization_id on newer tables
├─ subdomain rewrite via x-school-slug
└─ direct object IDs passed through routes/forms
```

### Sessions and JWT lifecycle

Supabase owns access/refresh tokens and secure cookie behavior through `@supabase/ssr`. Middleware calls `auth.getUser()`, allowing refresh-cookie propagation. The repository does not define session duration, inactivity timeout, concurrent-session policy, revocation UX, trusted devices, account lockout or active 2FA. Phase 9 tables for devices/sessions are not connected to Auth events.

### Invitation flow

`organization_invites` exists in migration schema, but there is no complete issue/accept/expire/revoke application flow. Signup receives `prefilledEmail` only in the client and accepts a client-selected `schoolId`; it does not require or verify a signed invite token.

### Secrets

Required variables are `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL`. Values were not exposed during audit. There is no `.env.example`, schema validation, startup validation, secret manager integration or rotation procedure. Service-role creation is now centralized and server-only.

## OWASP Report

| Category | Severity | Evidence |
|---|---|---|
| Broken access control | Critical | Client-selected tenant at signup; client-provided organization in school settings; legacy policies unavailable |
| IDOR | High | Multiple object routes query by ID and rely entirely on unverified legacy/new RLS; parent child routes do not verify guardian linkage |
| Injection | Medium | Supabase query builder limits SQL injection, but dynamic table selection and unvalidated data imports remain; no runtime schemas |
| XSS | High | `dangerouslySetInnerHTML` renders stored blog content and exam rules; no sanitizer dependency/policy is visible |
| CSRF | Medium | Server Actions benefit from framework origin protections, but the global configuration and deployment proxy trust are undocumented; destructive actions need re-authentication/confirmation policies |
| SSRF | Medium | User/admin-supplied external image URLs are rendered; no URL allowlist or proxy policy exists |
| Open redirect | High | `redirectTo.startsWith('/')` accepts protocol-relative strings such as `//host`; login/signup clients navigate to the returned value |
| File upload | High | Client-selected bucket, `image/*`, extension-derived filenames, public URLs, no size/signature checks, no tenant prefix, no storage-policy migration |
| Path traversal | Low | Generated upload paths discard directory portions, but raw extension and provider bucket selection remain untrusted |
| Security misconfiguration | High | No security headers/CSP, deprecated image domain config, global 10 MB Server Action body limit, every `/api` path treated public by middleware |
| Sensitive exposure | Medium | Raw database error strings are returned in multiple actions; structured redacted logging is absent |
| Weak cryptography | Low | Supabase handles password/token cryptography; custom invitation/API-key schemas are not implemented and cannot be verified |
| Dependency risk | Medium | Three npm advisories remain, none high/critical; Quill HTML export still requires sanitization |
| Rate limiting/brute force | Critical | No application enforcement for login, signup, password reset, contact, imports, submissions or API routes |
| Mass assignment | High | FormData values are manually copied without schemas; school tenant ID and broad settings are caller-controlled |
| Prototype pollution | Low | No direct object merge from JSON was found in active request handlers; imports/JSON metadata still need schema limits |
| Command injection | Low | No shell execution exists in request paths |

## Authentication Review

### Login

- Uses Supabase password authentication.
- Returns provider error messages directly, enabling avoidable account-state disclosure.
- No rate limiting, CAPTCHA escalation, lockout or security-event emission.
- “Remember me” and session duration are undefined.
- Redirect validation accepts protocol-relative values.

### Registration

- Password/PII logging was removed in prior remediation.
- No server-side length/format/password-policy validation exists.
- Client can select an arbitrary organization ID.
- Email confirmation behavior depends on external Supabase configuration and is not documented or tested.
- Profile creation uses service role after auth signup; partial failure can leave an orphan Auth user.

### Password reset

- Callback origin uses an environment variable with a localhost fallback; production startup does not enforce a production URL.
- No rate limiting or abuse telemetry.
- New-password input has no explicit minimum beyond provider policy.

## Authorization Review

- All 39 exported legacy admin actions now require `super_admin`.
- Protected dashboards use a shared role guard.
- School settings is an action-level gap: it trusts `organizationId` from the form and performs no explicit role check.
- Announcements/testimonials derive organization for create, but delete operations depend on RLS and do not include organization predicates.
- Legacy exam submission authenticates but scoring/attempt transitions remain split across different models.
- Middleware authentication is not authorization and must not be treated as an object access boundary.

## Tenant Isolation Review

Tenant isolation cannot be certified.

Reasons:

1. The repository lacks the original schema and RLS policies for legacy tables.
2. Many queries filter only by resource ID rather than both resource and organization.
3. Route loaders frequently fetch role without organization context.
4. The subdomain rewrite does not verify that the authenticated profile belongs to the requested school slug.
5. No automated cross-tenant RLS test suite exists.
6. Browser-created storage objects do not include an organization path prefix.
7. Future caching abstractions do not yet define organization as a mandatory cache-key component.

Every tenant repository should require an `organizationId` context that comes from the authenticated profile, not request data. RLS remains defense in depth, not the sole visible scope mechanism.

## API Security Review

`/api/v1/health` is the only route handler. Middleware considers all `/api` paths public, so every future route must enforce its own policy. Server Actions are the larger attack surface:

- No common runtime validation.
- No rate limiter.
- No request cost limits.
- Global 10 MB action body limit.
- Inconsistent errors and provider leakage.
- No standardized idempotency.
- No timeouts or cancellation for long imports/generation.
- Limited pagination; only one `.range()` call found.

## Database Review

### Security and integrity

- Newer migrations provide organization foreign keys and RLS.
- Several broad policies allow all operations to whole roles.
- Calculated analytics/productivity data needs service-only writers.
- Cross-table tenant IDs need composite foreign keys or validation triggers.
- Audit tables exist but active mutations do not emit comprehensive audit records.

### Query efficiency

- 45 broad `select('*')` calls.
- Only 15 explicit `.limit()` calls and one `.range()` call.
- Admin/user/question lists will grow without cursor pagination.
- Request-time dashboard counts and joins need measured query plans.
- No slow-query logging, `pg_stat_statements` process, connection-pool plan or database load baseline is documented.

### Transactions

School creation, exam generation/import, subject deletion, submission and publication span multiple writes without a single transaction. Manual compensation does not protect against process death, concurrency or compensation failure.

## File Storage Review

`ImageUpload.tsx` uploads directly from the browser:

- Accepts an arbitrary `bucket` prop.
- Uses a public URL.
- Stores objects at bucket root without tenant prefix.
- Claims a 2 MB maximum but does not enforce it.
- Accepts `image/*`, including SVG and potentially active formats.
- Trusts filename extension instead of validating magic bytes.
- No malware scanning, quarantine or metadata record.
- No storage RLS policy is present in repository migrations.

Blog uploads have the same validation gaps on the server and accept files under the global 10 MB action limit.

## Performance Report

### Frontend

- Only one dynamic import across the application.
- Rich editor, country/city data and charts are candidates for feature-local lazy loading.
- Fifteen raw image elements bypass optimization.
- Two pages exceed 1,300 lines; large client state increases render and hydration cost.
- No bundle analyzer, size budget, Core Web Vitals capture or synthetic performance test.

### Backend/database

- Direct page queries make batching and caching inconsistent.
- Broad payload projections waste bandwidth.
- Client-side filters require full datasets.
- No queue consumer exists for imports, delivery, analytics or report generation.
- No measured response-time SLO or query-time budget.

## Caching Report

Caching is minimal. The blog index uses revalidation while the home page is force-dynamic. There is no documented cache-key policy, invalidation ownership or tenant partitioning.

Required rules:

- Organization ID must be part of every tenant cache key.
- Authentication/authorization results must not be shared across users.
- Mutable assessment attempts must never use stale shared caches.
- Reference data can use tagged server caching with organization-scoped invalidation.
- Feature flags and entitlements need short TTLs plus explicit invalidation.

## Reliability Review

- Assessment autosave is simulated; no conflict version, retry queue or durable offline recovery exists.
- Submission is not an idempotent transaction.
- No circuit breakers or dependency timeout policy.
- No worker retry/dead-letter execution despite schemas.
- No graceful degradation for storage, email or analytics dependencies.
- Error boundaries and retry UI are absent.
- Backup/restore tables exist but no executor or restore drill exists.

## Observability Review

The health endpoint reports a static availability value and does not test database connectivity, Auth, Storage, queues or migration version. There is no:

- Structured logger
- Error tracking SDK
- Trace propagation
- Metrics exporter
- SLO dashboard
- Alert configuration
- Queue monitoring
- Usage telemetry implementation
- Correlated request ID across pages/actions/database logs

Audit-event schemas exist, but login, permission, publication, deletion and result-release events are not comprehensively emitted.

## Infrastructure Risks

- Deployment provider and edge/runtime assumptions are undocumented.
- Middleware and image configuration use deprecated patterns.
- No CI pipeline or migration gate.
- No connection pooling/capacity plan.
- No worker deployment topology.
- No secret rotation or incident response plan.
- No backup verification or recovery-time/recovery-point objectives.
- External images create privacy, availability and SSRF/content-policy concerns.

## Scalability Forecast

Capacity cannot be honestly estimated from this repository because no workload measurements exist.

| Scale | Forecast |
|---|---|
| 100 schools | Suitable only for controlled development after critical security fixes; assessment durability still blocks real use |
| 1,000 schools | Unbounded lists, direct queries and missing workers become operational bottlenecks |
| 10,000 schools | Current shared execution model, observability and tenant-verification approach is unacceptable |
| 100,000 schools | Requires deliberate partitioning/archival, mature workers, storage lifecycle, multi-region/recovery planning and proven SLOs |

Load tests must model synchronized exam starts, autosave bursts, timer-driven submissions, result-release fan-out and school-wide imports. Required inputs include students per assessment, autosave interval, answer payload size, submission window and grading/report concurrency. Inventing a concurrency number without those inputs would be misleading.

## Prioritized Remediation Plan

### P0 — stop release

1. Require verified invitations or approved enrollment for organization membership.
2. Derive school settings tenant from authenticated profile and enforce role.
3. Sanitize stored rich HTML at write and render boundaries.
4. Implement rate limits for authentication, reset, contact, import and submission.
5. Implement server-authoritative, idempotent assessment autosave/submission.
6. Restore a complete schema baseline and test every RLS policy cross-tenant.
7. Move uploads behind validated tenant-scoped server workflows and private storage policies.

### P1

- Add CSP/security headers and strict external resource allowlists.
- Add runtime validation and bounded strings/arrays/files.
- Move multi-write use cases into transactions.
- Add structured logs, error tracking and dependency health checks.
- Add cursor pagination and explicit projections.
- Deploy workers for queues/outboxes with retries and dead-letter handling.

### P2

- Lazy-load rich editor/chart/geography modules.
- Add tenant-safe reference caching and entitlement caching.
- Add query and bundle budgets.
- Establish backup/restore drills and data retention.
- Add session/device visibility and security-event alerts.

### P3

- Advanced circuit breakers and adaptive throttling.
- Storage archival/partitioning based on measured growth.
- Multi-region failover only after clear RTO/RPO requirements.

## First Hardening Milestone

Safely close two boundary defects without changing product capability:

1. Validate internal redirect targets and reject protocol-relative/external destinations.
2. Authorize school settings in the Server Action and derive the tenant from the authenticated school administrator rather than trusting form input.

### Milestone verification

- Redirect validation exercised against valid internal paths, protocol-relative URLs, backslash variants, absolute URLs, leading whitespace and empty input.
- Targeted ESLint passed for the changed authentication, authorization and redirect modules.
- `git diff --check` passed.
- `npm run build` passed: compilation, TypeScript validation and generation of all 95 application routes completed successfully.
- Build warnings remain for deprecated `images.domains` configuration and the Next.js `middleware` convention; both are tracked as non-blocking configuration debt.
