# Test Explorer Operations Production Certification

Audit date: 2026-07-21  
Scope: deployment, CI/CD, QA, onboarding, support, monitoring, backup/recovery, operations, documentation, billing, customer success, and release validation.

# Executive Summary

**Certification result: NO-GO. Test Explorer must not be deployed for real schools or paying customers.**

The repository produces a successful Next.js production build, uses a lockfile, emits a standalone server artifact, and contains forward-looking database schemas for operations. Those properties do not constitute an operable service. There is no CI/CD pipeline, automated test suite, deploy manifest, environment contract, migration runner, deployment approval, rollback runbook, monitoring integration, queue worker, backup implementation, restore proof, billing provider, support operating model, or executable production smoke test.

Several product paths presented as operational capabilities are UI shells. The seven-step onboarding wizard stores state only in React and the URL; its own final screen states that persistence is not connected. Student import is explicitly postponed. Assessment delivery and grading contain local-only simulated saves. Subscription, system-health, backup, restore, queue, feature-flag, and integration tables exist, but their supporting execution systems do not.

Production readiness score: **2/10**.

## Release gate evidence

| Gate | Result | Evidence |
|---|---|---|
| Production build | Pass | `npm run build`; compilation, TypeScript validation, and 95 routes completed |
| Lint | Fail | `npm run lint`: 298 errors and 115 warnings |
| Unit tests | Absent | No test runner, test script, or test files |
| Integration tests | Absent | No Supabase/RLS or service integration harness |
| E2E/smoke tests | Absent | No browser test dependency, configuration, fixtures, or scripts |
| Dependency scan | Conditional fail | 3 advisories: 2 moderate, 1 low; no automated policy gate |
| Migration validation | Not executable | SQL migrations exist, but no complete baseline/local Supabase config or CI apply/dry-run |
| Deployment | Absent | No workflow, platform manifest, environment promotion, or approval process |
| Rollback | Absent | No application or database rollback procedure |
| Runtime workflow simulation | Blocked/fail | No configured test database, seed identities, mail capture, billing sandbox, or browser runner |

# Deployment Review

## Current state

- `next.config.ts` sets `output: 'standalone'`, which can produce a deployable Node artifact.
- `package-lock.json` enables deterministic npm installation when deployments use `npm ci`.
- The application reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_EXAM_FLOW`.
- `.env.local` is ignored, but there is no committed `.env.example`, startup schema validation, ownership matrix, rotation procedure, or distinction between build-time and runtime variables.
- No Dockerfile, Vercel configuration, infrastructure-as-code, deployment script, release workflow, or runtime resource specification exists.
- `next.config.ts` uses deprecated `images.domains` and a global 10 MB Server Action body limit. The build also reports the deprecated middleware convention.

## Required release controls

1. Document every variable, sensitivity, owner, environment, rotation interval, and failure behavior.
2. Validate mandatory variables at process startup without exposing secret values.
3. Use separate development, preview, staging, and production Supabase projects and credentials.
4. Pin the Node runtime and package manager version.
5. Build once, promote the immutable artifact, attach provenance/SBOM, and record the Git SHA.
6. Use canary or blue/green application rollout with automated health verification.
7. Define database expand/migrate/contract releases; never couple irreversible schema changes to instant application rollout.

# CI/CD Review

There is no `.github/workflows` directory or equivalent pipeline. A developer can merge code that fails lint, has no tests, changes migrations unsafely, or cannot deploy.

Required pull-request gates:

1. `npm ci` with a pinned runtime.
2. Formatting check and lint with zero errors.
3. Explicit `tsc --noEmit` rather than relying only on the build.
4. Unit and component tests with coverage thresholds focused on critical logic.
5. Ephemeral-database migration application from an empty baseline.
6. RLS/tenant isolation integration tests.
7. Production build and bundle-budget check.
8. Dependency, secret, SAST, and migration scans.
9. E2E tests for critical role journeys.
10. Required reviewers and a production deployment approval separated from merge.

Production deployments must run pre-deploy database compatibility checks, deploy the immutable artifact, run authenticated smoke tests, observe an error/latency window, and automatically halt or roll back the application when thresholds fail.

# Testing Review

No automated tests exist. The `package.json` scripts contain only `dev`, `build`, `start`, and `lint`. There is no coverage tooling or fixture strategy.

Minimum release suite:

- Authentication: registration/invitation, login, logout, reset, expiry, disabled tenant.
- Authorization: every role against every protected action, including negative and cross-tenant cases.
- Database: all migrations from empty state and supported prior release; RLS policy matrix.
- Assessment: attempt start, autosave idempotency, reconnect, deadline, timeout, duplicate submit, scoring, release policy.
- Operations: suspend/activate organization, feature flag precedence, audit recording, license limits.
- Billing: webhook signature, replay protection, duplicate events, payment failure, renewal, cancellation, invoice reconciliation.
- E2E: the complete school-to-parent journey with deterministic seeded identities.
- Non-functional: accessibility, peak-exam load, soak, backup restore, and disaster-recovery exercises.

The current production build passing does not validate runtime Supabase queries, RLS, email, storage, billing, or browser behavior.

# Onboarding Review

`components/onboarding/onboarding-wizard.tsx` provides seven visual steps but is not an onboarding system:

- Inputs have no persisted form model or submission action.
- `Save & exit` only navigates away.
- progress is encoded in `?step=` and can be changed arbitrarily.
- teacher email entries do not create invitations.
- student import says it is postponed.
- completion does not create school details, academic year, grades, or sections.
- the final screen explicitly says database persistence is not connected.

Although `onboarding_progress` exists in `202607200001_phase_1_school_foundation.sql`, the wizard does not use it. A school cannot independently complete setup, so customer onboarding fails its primary acceptance criterion.

There is no implemented resettable demo tenant, seed manifest, sample dataset version, reset job, or isolation mechanism. Claims of sample analytics would therefore be unsafe unless derived from explicit demo fixtures.

# Support Experience Review

- Public FAQ, contact, getting-started, privacy, security, and policy pages exist.
- The repository has phase implementation plans but no operator-grade help center architecture, searchable product documentation, role-specific guides, or versioned release notes.
- There is no support ticket state, severity model, ownership, response SLA, escalation path, incident communication template, or customer-visible status integration.
- Bug reporting, feature requests, onboarding ratings, and screenshot capture are not connected to a support workflow.

Before launch, define P1–P4 support severity, school-hours and exam-hours coverage, escalation ownership, communication intervals, data-handling rules, and a searchable incident history.

# Monitoring Review

`app/api/v1/health/route.ts` returns a static `available` response. It does not check Supabase connectivity, migration compatibility, storage, background jobs, mail, billing, or dependency latency. It can return 200 while the product is unusable.

`system_health_snapshots`, `background_jobs`, and webhook-delivery tables are schema only. No process produces health snapshots or consumes jobs. Operations pages render descriptive shells rather than live operational state.

Missing production signals:

- request rate, latency and errors by route/status/tenant class;
- authentication failures and lockouts;
- database pool usage, query latency, locks, replication and storage growth;
- autosave latency/error/conflict and submission success/duplicate counts;
- queue depth, oldest-job age, retries, dead letters and worker saturation;
- webhook and notification delivery outcomes;
- frontend exceptions and Core Web Vitals;
- billing reconciliation failures;
- SLO burn-rate alerts and synthetic critical-journey probes.

Logs must be structured, correlated by request/trace ID, redact student data and credentials, and have bounded retention and access controls.

# Backups and Disaster Recovery

The SaaS operations migration defines `backup_policies`, `backup_runs`, and `restore_requests`. These tables record intent; they do not create database or storage backups. No scheduler, exporter, encryption configuration, immutable retention, restore worker, or verification evidence exists.

Launch requirements:

- documented Supabase database and object-storage backup mechanisms;
- encrypted, access-controlled, geographically appropriate copies;
- explicit RPO/RTO approved by the business;
- daily automated evidence of successful backup completion;
- quarterly full restore and monthly targeted-restore exercises;
- restore runbook covering tenant scope, integrity validation and customer communication;
- retention/deletion rules aligned with school contracts and privacy obligations.

No production data should be accepted until a restore into an isolated environment has been successfully timed and verified.

# Operations Review

- Feature flag types and database tables exist, but no complete evaluation repository, mutation workflow, cache invalidation, audit trail verification, or emergency kill-switch procedure is active.
- Audit/security tables exist, but important application actions are not shown to consistently emit immutable audit events.
- No maintenance-mode control or tested read-only degradation mode exists.
- No queue runner, scheduler, leader election, retry service, or dead-letter operator workflow exists.
- Platform administration screens under `/dashboard/admin/operations` are descriptive shells.
- There is no on-call rota, incident command process, status page, change calendar, error budget, capacity review, or operational ownership matrix.

# Documentation Review

The `docs/` directory contains phase design plans. Missing release documentation includes:

- repository README and supported runtime matrix;
- local Supabase setup and reproducible schema bootstrap;
- architecture decision records and dependency/data-flow diagram;
- production deployment and rollback guide;
- migration authoring, review and recovery policy;
- monitoring, alerting and dashboard catalog;
- authentication, database, storage, billing, queue and notification runbooks;
- incident response, disaster recovery and security escalation guides;
- versioned API/OpenAPI documentation;
- release notes, known-issues template and customer communication process.

# Business Readiness

`lib/platform/billing.ts` defines a replaceable provider interface, and the database models plans, entitlements, subscriptions, invoices, payments, coupons and licenses. No provider is registered and there are no checkout, portal, webhook, reconciliation, renewal, tax, refund, invoice-generation, dunning, or entitlement-enforcement workflows.

The operations subscription page is a shell. Seat and storage limits are not demonstrated at mutation boundaries. Trial expiry and suspended/past-due tenant behavior are not enforced consistently. Subscription renewal in the required final simulation is therefore impossible.

Launch requires a sandbox-certified billing provider, signed and replay-safe webhooks, an idempotent ledger/reconciliation process, entitlement enforcement, finance exports, refund controls, invoice numbering/tax review, and manual recovery procedures.

# Customer Success Review

The repository does not implement a verifiable school health score, feature-adoption pipeline, inactive-user detection, engagement alerts, trial conversion workflow, renewal reminders, or customer-success dashboard backed by event data.

Before production, define each metric with source events, exclusions, ownership, freshness, privacy classification and action thresholds. Do not derive customer health from synthetic or placeholder analytics. Establish onboarding completion, time-to-first-assessment, assessment completion, teacher weekly activity, support burden, failed assessment rate, and renewal risk as initial operational measures.

# Final Workflow Validation

The requested end-to-end simulation could not be certified:

| Journey stage | Result |
|---|---|
| Create/configure school | Partial legacy action; onboarding does not persist |
| Invite teachers | Not connected from onboarding |
| Import students | Explicit placeholder |
| Create question bank | UI/schema present; full runtime path not testable without database fixtures |
| Create/assign assessment | Builder UI/schema present; no automated runtime certification |
| Student takes assessment | Player exists; durable autosave/submission not established |
| Teacher grades | Grading UI reports local simulated save/no persisted response |
| Publish results | Not operationally certified |
| Principal analytics | Predominantly empty/snapshot-dependent surfaces |
| Parent views results | Route shells exist; linkage/runtime proof absent |
| Subscription renewed | No billing provider or webhook workflow |

The environment lacks a configured disposable database, deterministic seed, mail catcher, billing sandbox, and browser automation. The workflow therefore fails certification rather than being treated as implicitly successful.

# Launch Risks and Critical Blockers

## P0 — release blockers

1. Core school onboarding does not persist or complete required operations.
2. Assessment autosave, submission and grading are not proven durable end to end.
3. No automated tests, RLS verification, or executable critical-journey smoke test.
4. Lint fails with 298 errors, including hook-order violations.
5. No CI/CD, deployment approval, immutable promotion, or rollback workflow.
6. No complete reproducible database baseline or migration validation pipeline.
7. No production monitoring/error tracking/SLO alerting.
8. No implemented backup/restore system or successful recovery exercise.
9. Billing, renewal, licensing and entitlement enforcement are not operational.
10. Previously documented security blockers remain: arbitrary organization enrollment, missing rate limits, unsafe rich HTML, upload boundaries, and incomplete tenant-isolation proof.

## P1

- Implement workers and operational controls for jobs, notifications and webhooks.
- Establish structured logging, correlation, retention and privacy controls.
- Add staging, demo fixtures, support processes and incident management.
- Resolve dependency advisories or formally assess and contain them.
- Replace deprecated Next.js configuration and establish bundle/query budgets.

# Go/No-Go Checklist

All items below must be green before launch:

- [ ] P0 security findings closed and independently verified.
- [ ] Onboarding, invitations and student import persist transactionally.
- [ ] Assessment start/autosave/submit/grade/release passes failure-injection E2E tests.
- [ ] Complete schema builds from empty state and upgrades from the previous release.
- [ ] Cross-tenant RLS matrix passes for every role and table.
- [ ] Lint, type check, tests, build and security scans pass in required CI.
- [ ] Staging mirrors production topology without sharing data or credentials.
- [ ] Canary deployment and application rollback tested.
- [ ] Database expand/contract migration and recovery procedure tested.
- [ ] Health checks, dashboards, SLOs, alerts and on-call escalation active.
- [ ] Backup restore meets approved RPO/RTO.
- [ ] Billing sandbox journey and reconciliation pass.
- [ ] Support runbooks, status communication and customer escalation active.
- [ ] Peak-exam load and autosave/submission spike tests meet capacity margins.
- [ ] Legal/privacy/data-retention controls approved for target markets.

# Rollback Checklist

1. Identify release SHA, schema version, feature-flag changes and incident commander.
2. Stop rollout and disable affected capability through a tested kill switch.
3. Preserve logs, traces, audit evidence and queue payloads.
4. Roll application traffic to the last verified immutable artifact.
5. Do not reverse destructive migrations; use forward-compatible remediation or verified restore.
6. Verify authentication, tenant isolation, attempt autosave/submission and read paths.
7. Reconcile queues, webhooks, billing events and partially completed writes idempotently.
8. Communicate scope, customer impact, mitigations and next update time.
9. Monitor recovery SLOs and close only after data-integrity checks.
10. Complete a blameless review and add regression coverage.

# Post-Launch Monitoring Checklist

- SLO burn rates for availability, latency and assessment submission success.
- Error rates and p95/p99 latency by critical route.
- Database saturation, locks, slow queries and storage growth.
- Autosave age, retry rate, conflicts and lost-update indicators.
- Queue age, failures, dead letters and webhook backlog.
- Login/reset abuse and authorization-denial anomalies.
- Cross-tenant security alerts and privileged changes.
- Billing webhook/reconciliation failures and entitlement drift.
- Backup success and restore-verification freshness.
- Customer support volume and school-specific incident clusters.

# 30-Day Stabilization Plan

## Days 1–7: establish truthful gates

- Freeze feature development.
- Create reproducible local/staging database baselines and fixtures.
- Fix lint errors that represent runtime correctness, beginning with Hooks violations.
- Add CI for install, lint, type, migration, unit, integration and build gates.
- Define release ownership, severity levels, SLOs and the incident process.

## Days 8–14: secure and persist the critical journey

- Close outstanding P0 security findings.
- Make onboarding and invitations transactional and resumable.
- Complete server-authoritative assessment autosave/submission/grading.
- Add authorization, RLS and assessment lifecycle integration tests.

## Days 15–21: recovery and observability

- Integrate structured logs, error tracking, metrics and alerting.
- Implement dependency-aware readiness and minimal liveness endpoints.
- Deploy job workers with retries/dead letters.
- Execute and time a database plus storage restore.

## Days 22–30: release rehearsal

- Complete the deterministic E2E school journey in staging.
- Run peak-exam load and failure-injection tests.
- Exercise canary, rollback, billing reconciliation and incident communications.
- Conduct a formal go/no-go review with evidence attached to every gate.

# 90-Day Roadmap

## Days 31–60

- Operationalize billing, licensing, customer support and demo reset workflows.
- Add synthetic monitoring, query/bundle budgets, capacity dashboards and adoption metrics.
- Complete privacy, retention, export and deletion verification.
- Run accessibility and cross-browser regression suites.

## Days 61–90

- Establish quarterly disaster-recovery and security exercises.
- Automate dependency and migration risk review.
- Measure production SLOs and set error budgets from actual workload data.
- Revisit database/storage archival, read scaling and worker capacity using measured growth.
- Launch only through a limited pilot with explicit support coverage and rollback criteria after every P0 gate is green.

# Final Recommendation

**NO-GO.** A successful build is the only meaningful release gate currently passing. Test Explorer cannot yet be safely deployed, operated, recovered, billed, or supported as a commercial educational SaaS. Certification should be repeated after the P0 checklist is completed and evidenced in CI, staging, load tests, restore exercises, and an end-to-end release rehearsal.
