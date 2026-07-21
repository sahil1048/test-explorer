# Test Explorer Production Readiness Audit

Audit date: 2026-07-21
Scope: 330 TypeScript/TSX files, 9 SQL migrations, application routes, server actions, configuration and dependency graph.

# Executive Summary

**Verdict: do not deploy to real schools or paying customers.**

The repository builds, but the commercial school platform represented in Phases 1–9 is primarily schema scaffolding and UI shells. Critical workflows such as assessment autosave/submission, grading, communication delivery, analytics, onboarding persistence, subscriptions and operational controls are explicitly placeholders. The legacy competitive-exam workflows contain the only substantial persistence, while several privileged server actions do not perform authorization in the action itself.

Production readiness score: **2/10**. The immediate release blockers are unauthenticated service-role mutations, sensitive signup logging, insecure dependency versions, incomplete tenant verification, a failing lint baseline, no tests, no error boundaries, and no deploy/rollback/monitoring pipeline.

## Verified baseline

- `next build`: passes; 95 routes generated.
- `eslint`: fails with **299 errors and 117 warnings across 123 files**.
- `npm audit`: **14 vulnerabilities**: 8 high, 4 moderate and 2 low. Direct Next.js 16.0.8 advisories include authorization-bypass, SSRF and denial-of-service classes; a non-major upgrade is available.
- Automated tests: none; no test runner or test scripts.
- Internal dependency scan: 330 source files, 378 internal import edges, no detected cycles.
- Browser workflow execution: blocked because no browser backend is available in the environment. No UI flow is marked verified.
- Database runtime verification: not possible from repository state; there is no reproducible baseline schema or local Supabase configuration.

# Critical Issues (P0)

1. **Unauthenticated service-role school administration.** `app/dashboard/admin/schools/actions.ts` creates a service-role client and performs school creation, update and destructive deletion without authenticating the caller or checking `super_admin`. Server actions are callable endpoints; a page-level navigation restriction is not authorization.
2. **Signup logs credentials and personal data.** `app/auth/actions.ts` logs `Object.fromEntries(formData.entries())`, which includes the password, email, phone and other registration data.
3. **Arbitrary tenant enrollment.** `signup()` accepts client-provided `schoolId` and writes it through the service role without an invite, enrollment policy or school lifecycle check. A user can attach a student profile to any known organization ID.
4. **Attempt ownership is not enforced.** `app/mocktest/actions.ts` does not authenticate, trusts caller-provided `attemptId`, and updates by ID without `user_id`, status or exam ownership predicates.
5. **The student assessment player does not persist.** `features/assessment-player/components/assessment-player.tsx` simulates autosave with a timeout; confirmation is a link and `submitted/page.tsx` states that persistence is not connected. The core promise “your work is always safe” is therefore false.
6. **Privileged admin actions are not consistently authorized.** Most files under `app/dashboard/admin/**/actions.ts` mutate records without an action-level role check. There was no `/dashboard/admin/layout.tsx` guard at audit time. RLS for the legacy tables cannot be verified because their creating migrations are absent.
7. **Known-vulnerable framework version.** `package.json` pins Next.js 16.0.8; `npm audit` reports direct high-severity advisories and recommends 16.2.10.
8. **Database cannot be reproduced or proven tenant-safe.** Migrations begin by altering pre-existing `organizations` and `profiles`; the repository does not contain the baseline definitions for legacy tables used throughout the app. Consequently foreign keys, RLS and policies for `courses`, `questions`, `exam_attempts`, `blogs`, `school_announcements` and other legacy tables cannot be audited or recreated.

# High Priority (P1)

- Lint fails with 131 explicit-`any` findings, 59 render-time component definitions, 28 TypeScript suppressions and 3 Rules-of-Hooks errors. A conditional hook exists in `MockTestInterface.tsx`.
- No unit, integration, RLS, API or E2E tests. Assessment scoring and submission have no regression protection.
- No standardized 404, 403, route error, global error or offline recovery surfaces.
- Middleware treats every unknown first path segment as a school slug and rewrites it. It does not verify the requested slug against the authenticated user’s organization.
- Dashboard route guards fetch only `role`, not `organization_id`; object routes rely entirely on unknown RLS behavior for tenant isolation.
- Parent child routes do not load or verify `parent_student_links`; pages are shells using the URL student ID.
- Question-bank policies allow every teacher full CRUD over every tenant question-related table, including revision and attachment records; author/reviewer separation is not enforced.
- Communication, evaluation, intelligence and operations modules contain controls that do not persist.
- `dangerouslySetInnerHTML` is used for blog and exam content without a visible sanitizer dependency.
- Image uploads accept `image/*`; client code does not enforce size, MIME signature or dimensions. Storage policy definitions are absent.
- No rate limiting or brute-force protection exists in application code for login, signup, reset, contact, imports or server actions.
- No transaction wraps multi-record school creation, exam import, blueprint generation or destructive subject deletion. Partial failure leaves inconsistent data.
- School creation exposes an initial password as a plain text form field in `app/dashboard/admin/schools/new/page.tsx`.

# Medium Priority (P2)

- 100 client components but only one dynamic import; large editors and chart dependencies are not deliberately split.
- `app/exams/[slug]/page.tsx` is 1,716 lines and `app/dashboard/admin/exam-landing-pages/[id]/page.tsx` is 1,366 lines. Both combine data, state, validation and rendering.
- `react-icons` and `svix` are declared but unused. `svix` also contributes an audited vulnerable transitive dependency.
- Fifteen raw `<img>` usages bypass Next image optimization.
- Most data queries use `select('*')`; explicit payload projections, pagination and query budgets are inconsistent.
- No cache policy exists beyond one blog revalidation setting; the home route is force-dynamic.
- No background-job executor exists despite queue/outbox schemas.
- Console logging is used for operational and error paths without redaction, levels, request IDs or a log sink.
- Forms use ad hoc validation; there is no shared validation schema library or consistent error contract.
- Multiple role guards repeat string arrays and redirect behavior rather than using the permission model.
- Dark mode and responsive classes exist, but accessibility and responsive behavior have no automated or browser verification.

# Low Priority (P3)

- Naming mixes legacy “streams/mock tests/exams” with school-domain “grades/assessments”.
- Many phase components are minified onto single lines, increasing review and maintenance cost.
- Commented implementation notes and stale “future/placeholder” copy are visible to users.
- The `middleware` convention and `images.domains` configuration are deprecated in the current Next build.
- Baseline browser mapping data is stale.

# Architecture Review

The application is a Next.js App Router monolith with server components/pages, client components, server actions and direct Supabase access. Newer modules are feature-folder UI shells (`features/question-*`, `assessment-*`, `evaluation`, `intelligence`, `communication`); legacy modules remain route- and component-oriented under `app/dashboard/admin` and `components/admin`. There is no consistent repository/service boundary: pages and actions query Supabase directly, while newer provider contracts are not wired to persistence.

Dependency direction is generally acyclic, but boundaries are weak: UI imports database clients, actions contain business logic and scoring, and authorization is repeated in layouts. State is local React state plus Supabase; there is no global client store. Critical assessment state is local-only.

# Security Review

- Authentication uses Supabase password auth and server cookie clients.
- Authorization is split between layout role checks and RLS. Layout checks are insufficient for server actions.
- Service-role usage is not centralized or uniformly guarded.
- Tenant identity is often inferred from profile but legacy queries frequently lack an explicit organization predicate.
- HTML content and rich text require server-side sanitization before rendering.
- Secrets are present only through environment keys in source references; `.env.local` values were not read or exposed. No `.env.example` documents requirements.
- No CSP, security header policy, upload quarantine, API throttling, lockout, session/device management or security-event integration is active.

# Performance Review

There is no measurement harness, tracing or bundle budget. The largest route components exceed 1,300–1,700 lines. Only one dynamic import exists across the source tree. Queries commonly request all columns and large legacy lists lack server pagination. Dashboard queries issue broad counts and list reads on every request. The schema contains useful indexes in new migrations, but production query plans cannot be measured without a database snapshot.

# Database Review

New tables generally carry `organization_id`, foreign keys and indexes, but migration quality is inconsistent:

- The migrations are not a complete schema history.
- Several policies grant `for all` to broad roles rather than separating read/create/review/publish capabilities.
- Analytics and productivity snapshot tables are writable by school admins through broad policies, allowing metrics to be altered from authenticated clients.
- Parent and student linkage integrity exists in schema but is not used by route loaders.
- Multiple multi-table workflows are implemented in application code without SQL transactions or RPCs.
- Migration application and generated Supabase types are repeatedly listed as unfinished in phase plans.

# Frontend Review

The visual system uses Tailwind and shadcn-style primitives, but implementation consistency is limited by duplicated ad hoc inputs, buttons and dialogs. Core school features frequently render honest empty states, yet those surfaces demonstrate that workflows are not connected. Loading coverage is limited to two shared loading components. There are no error boundaries. React lint identifies conditional hooks, effect-driven state updates and components created during render.

# Backend Review

There is no distinct backend layer. Server actions act as controllers, validators, authorization checks and services simultaneously. Error responses are arbitrary `{ error: string }` objects. Inputs are cast from `FormData` without schemas. Idempotency, timeouts and retry semantics are absent from active workflows. The only v1 API endpoint is health; the proposed versioned API, keys and rate limiting are contracts rather than implementation.

# UX Review

Runtime visual verification is outstanding because no browser backend was available. Source inspection identifies dead ends: submit links without persistence, disabled result-release actions, nonfunctional communication composer buttons, nonpersistent grading autosave and placeholder analytics. Users can reach pages that imply capability but cannot complete the workflow. Onboarding explicitly says persistence and student import are not connected.

# Accessibility Review

Positive source-level patterns include some `aria-live`, `aria-modal`, labels and 44px-style assessment controls. Gaps include missing dialog focus trapping/restoration, unlabelled icon buttons, no skip link, no error summary/focus behavior, no automated axe checks, and no keyboard-flow tests. WCAG AA conformance cannot be claimed.

# Code Quality Review

Lint is a hard failure. The top findings are `no-explicit-any` (131), unused symbols (96), unescaped JSX text (67), render-time components (59), and banned TypeScript suppressions (28). There are no detected circular imports, but the lack of types and oversized components create high change risk.

# API Review

The application exposes Server Actions rather than a documented API. They have inconsistent authentication, authorization, validation, status semantics and error structures. Pagination and rate limiting are absent. The v1 health endpoint returns a request ID but does not test database, storage, queue or dependency health.

# Testing Review

There is no testing framework or test code. Minimum release gates must include permission/RLS integration tests, scoring unit tests, attempt lifecycle integration tests, autosave/reconnect E2E tests, role-based navigation tests, destructive-action tests, accessibility scans and a production smoke suite.

# Technical Debt Report

1. Legacy competitive-exam domain and school assessment domain coexist without a migration boundary.
2. Direct Supabase access is distributed across pages, actions and client components.
3. New phase modules are mostly presentation scaffolds disconnected from repositories.
4. Authorization is role-string based and repeated despite a permission vocabulary.
5. No generated database types are used.
6. No complete schema, fixtures, local environment or CI release gate exists.
7. Large components and pervasive `any` make security fixes difficult to verify.

# Milestone Plan

## Milestone 0 — Stop exploitable operations

- Guard every service-role action and the complete admin route tree.
- Remove credential/PII logging.
- Enforce authenticated attempt ownership.
- Upgrade vulnerable direct dependencies.
- Add regression tests for authorization helpers and scoring.

## Milestone 1 — Make assessment delivery truthful and durable

- Implement server-authoritative attempt start, autosave, submit and timeout transitions.
- Add idempotency and optimistic concurrency.
- Enforce assignment windows, attempts, release rules and tenant ownership in database transactions.

## Milestone 2 — Establish tenant-safe repositories

- Restore a reproducible baseline schema and generated types.
- Inventory and test RLS for every table.
- Move tenant queries behind scoped repositories and remove broad `select('*')` reads.

## Milestone 3 — Quality gates and recovery

- Reach zero lint errors, add unit/integration/E2E suites, standardized error boundaries and deployment smoke tests.
- Add structured logging, error tracking, health dependencies, backups and rollback runbooks.

## Milestone 4 — UX/accessibility/performance verification

- Execute every role workflow in desktop/tablet/mobile browsers.
- Add axe checks, keyboard test cases, bundle budgets, query budgets and measured performance targets.

# Remediation Log

## Milestone 0 — privileged operations containment

- Added action-level `super_admin` authorization to all 39 exported actions under `app/dashboard/admin`.
- Added a guard for the full `/dashboard/admin` route tree.
- Centralized service-role client creation in a server-only module.
- Removed signup logging that included passwords and personal data.
- Bound legacy mock submission to the authenticated user, matching exam, in-progress state and attempt ID.
- Upgraded Next.js from 16.0.8 to 16.2.10, updated safe transitive dependencies, and removed unused `react-icons` and `svix` packages.
- Dependency audit changed from 14 findings (8 high) to 3 findings (0 high). Remaining findings are the Quill 2.0.3 HTML-export advisory and the Next-bundled PostCSS advisory for which npm proposes an unsafe framework downgrade; neither was forced.
- Production build passed with all 95 routes after remediation.
- Full lint remains failing at 298 errors and 115 warnings and remains a release blocker.
