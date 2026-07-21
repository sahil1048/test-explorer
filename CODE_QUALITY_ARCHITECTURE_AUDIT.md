# Test Explorer Code Quality and Architecture Audit

Audit date: 2026-07-21

## 1. Executive Summary

Test Explorer is a Next.js App Router monolith containing two generations of product code: a substantial legacy competitive-exam/content application and newer school-assessment feature shells. The newer code has better feature naming and additive tenant-aware schemas, but it is largely UI-first and disconnected from persistence. The legacy code contains working database operations but concentrates business rules, authorization, validation and persistence in pages and server actions.

The codebase builds, has strict TypeScript enabled and has no detected internal import cycles. Those properties are not sufficient for production readiness. Repository lint fails with 298 errors and 115 warnings; no automated tests exist; 85 `app` files query Supabase directly; the database history is incomplete; and core boundaries such as repositories, services, validators and transactional use cases are absent.

**Architecture recommendation:** retain the Next.js/Supabase stack and incrementally introduce vertical feature slices with server-only application services, tenant-scoped repositories, runtime validation and shared authorization. Do not rewrite the application or create a generic abstraction over every Supabase call.

## 2. Architecture Score

**3/10**

Strengths: App Router is consistently used, feature folders now exist, newer tables generally include tenant IDs and RLS, internal imports are acyclic, and provider boundaries exist for future billing/communication/productivity integrations.

Failures: no reliable domain/application/data boundary, incomplete schema history, business logic in actions, UI shells disconnected from services, repeated role guards, and no test boundary.

## 3. Code Quality Score

**2/10**

- 298 lint errors and 115 warnings.
- 131 explicit `any` findings.
- 28 TypeScript suppressions.
- 59 components declared during render.
- Three Rules-of-Hooks violations.
- Largest source files: 1,716 and 1,366 lines.
- Multiple feature components are compressed into single-line implementations.

## 4. Maintainability Score

**2.5/10**

Changes to legacy assessments, content or school administration require understanding page components, direct Supabase queries, mutable form payloads and database behavior simultaneously. There is no generated schema type boundary and almost no isolated business logic that can be unit tested.

## 5. Scalability Score

**2.5/10**

New schemas anticipate tenant indexes, queues and snapshots, but execution paths do not. Large unpaginated queries, `select('*')`, request-time aggregates, client-side filtering and absent workers will not support thousands of schools. Tenant isolation for legacy tables cannot be proven from this repository.

## 6. Architecture Map

```text
Browser
├─ Public client components
├─ Dashboard client components (local React state)
└─ Supabase browser client in selected legacy components
       ↓
Next.js App Router
├─ Server pages/layouts → direct Supabase queries
├─ Server Actions → authorization + validation + business rules + persistence
├─ Middleware → session refresh + subdomain rewrite
└─ /api/v1/health (only route handler)
       ↓
Supabase
├─ Auth and cookie session
├─ Postgres + RLS
├─ Storage for images
└─ RPCs used by legacy dashboard/exam flows

Unwired contracts
├─ Billing provider
├─ Communication provider/event router
├─ Productivity provider
├─ Integration provider
└─ Rate limiter / API contracts
```

### Frontend architecture

- `app/`: routes, server pages, actions and route-level guards.
- `components/`: shared UI plus large legacy domain components.
- `features/`: newer vertical UI modules and a small number of types.
- `components/ui/`: shadcn/Radix-derived primitives.
- State: local React state; 295 `useState` references, 33 `useEffect`, 6 `useMemo`, no application store.
- Server state: fetched directly in server pages or client effects; no query cache or consistent optimistic-update mechanism.

### Backend architecture

There is no independent backend layer. Twenty action files contain controller, use-case and repository behavior together. The largest action modules are `subjects/actions.ts` (355 lines), `blueprints/actions.ts` (307), `exams/actions.ts` (299), and legacy exam submission (237).

### Database architecture

Nine additive migrations introduce school, question, assessment, evaluation, intelligence, productivity, communication and SaaS-operation tables. They assume an external legacy schema for `organizations`, `profiles`, `courses`, `questions`, `exam_attempts` and related records. The repository therefore cannot bootstrap a clean database.

### API architecture

`/api/v1/health` is the only route handler. The practical API consists of Server Actions with inconsistent result objects. There is no common request validation, domain-error mapping, pagination contract or idempotency implementation.

### Authentication and authorization

Supabase Auth supplies sessions. Dashboard layouts fetch profiles and compare role strings. Privileged admin actions now use `requireSuperAdmin`, but other role guards remain duplicated and object-level tenant access is delegated to RLS. The permission vocabulary in `lib/auth/permissions.ts` is not the enforcement source for most routes.

### Notifications and background work

Notification, communication, queue and delivery schemas exist. The visible Notification Center now shows an honest empty state. No worker consumes communication events, background jobs, analytics snapshots or delivery retries.

## 7. Technical Debt Report

### Critical

1. **Incomplete database baseline.** A clean deployment cannot be reproduced or RLS-audited.
2. **Non-persistent school feature shells.** Public interfaces and domain schemas exist without application services.
3. **Direct database coupling.** At least 99 files query Supabase directly: 85 in `app`, 9 in `components`, 1 in `features`, 4 in `lib`.
4. **No automated tests.** Refactoring has no behavioral safety net.
5. **Legacy/new domain split.** `exams`, `mock_tests`, `practice_tests`, and `exam_attempts` coexist with new `assessments` and `assessment_attempts` without a documented compatibility boundary.

### High

- Server actions parse `FormData` through unchecked casts.
- Multi-table workflows lack transactions.
- Role checks are repeated string arrays.
- Supabase generated types are absent.
- Scoring logic is duplicated between legacy submission actions.
- Large pages combine fetching, transformation, validation, state and rendering.
- Error returns vary between strings, thrown errors, redirects and console output.
- `allowJs` and `skipLibCheck` reduce type assurance despite an all-TypeScript source tree.

### Medium

- `next.config.ts` permits 10 MB Server Action bodies globally, increasing memory/abuse exposure for every action rather than isolating imports.
- `images.domains` is deprecated and less restrictive than explicit remote patterns.
- Only one dynamic import exists despite rich-text and chart dependencies.
- Revalidation is broad and inconsistent.
- New provider registries are contracts without composition roots or tests.
- Duplicate legacy/new announcements, questions and assessment concepts create ownership ambiguity.

## 8. Frontend Review

### God components

- `app/exams/[slug]/page.tsx`: 1,716 lines.
- `app/dashboard/admin/exam-landing-pages/[id]/page.tsx`: 1,366 lines.
- `components/admin/content-manager.tsx`: 727 lines.
- `components/blogs/blog-form.tsx`: 561 lines.

These should be decomposed by use case and stable UI section, not by arbitrary line count. The exam landing editor should extract typed section editors and a single form-state reducer. The public exam page should separate data normalization, SEO metadata, section rendering and enrollment actions.

### Rendering and hooks

Lint reports 59 render-time component definitions, which recreate component identities and can discard state. Conditional hooks in legacy assessment interfaces are correctness defects. Effect-driven derived state and missing dependencies create race and stale-closure risks.

### Reuse

New modules visually repeat headers, filter bars, empty states, cards and modal overlays. Extract shared primitives only after defining behavior contracts—especially accessibility, loading, errors and mobile behavior. Avoid a generic “everything card” abstraction.

## 9. Backend Review

Server Actions are fat controllers. For example, blueprint generation queries pools, selects questions, constructs a mock test, inserts link records and compensates manually on failure. Subject deletion manually traverses multiple relationships. These belong in transactional application services or database RPCs with explicit inputs and domain results.

Recommended per-feature layering:

```text
feature/
├─ domain/          pure types, rules and state transitions
├─ application/     use cases and authorization requirements
├─ data/            tenant-scoped Supabase repositories
├─ server/          Server Actions / DTO validation
└─ components/      UI only
```

Use this structure for high-risk features first; do not reorganize every presentational component.

## 10. Database Review

- Tenant IDs and indexes are present in newer schemas.
- Broad `FOR ALL` policies merge responsibilities such as authoring, approval and analytics snapshot writes.
- Cross-table tenant equality is not universally enforced by composite foreign keys.
- Multi-row application operations need transactions and idempotency.
- Search strategy is undefined for large question banks; `%ILIKE%` application queries will not scale without search indexes or a dedicated projection.
- Snapshot tables require a controlled writer; authenticated school administrators should not directly mutate calculated analytics.
- Migration filenames are phase/date oriented but no migration verification or rollback process exists.

## 11. API Design Review

The v1 API is a contract rather than an implementation. Server Actions return inconsistent shapes such as `{ error }`, `{ success }`, redirect paths, and domain values. There are no shared error codes, runtime schemas, request IDs or status semantics.

Recommended backward-compatible action result:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } }
```

Introduce it per feature; do not change all existing callers in one commit.

## 12. State Management Review

Local state is appropriate for ephemeral filters and dialog visibility. It is incorrectly used as the authority for assessment answers, autosave state and grading drafts. Durable school workflows need server-owned state with version numbers, idempotency keys and explicit reconciliation.

There is no evidence that a global client store is necessary. Prefer server components for initial state and focused client islands. Introduce a query cache only for screens with real mutation/refetch pressure, not as a blanket architectural fix.

## 13. TypeScript Review

Strict mode is enabled, but effectiveness is undermined by 131 explicit `any` findings, 28 suppressions, missing generated database types and unchecked `FormData` casts. Shared enums are duplicated between SQL checks, UI arrays and TypeScript unions.

Priority:

1. Generate Supabase database types.
2. Type authentication/profile boundaries.
3. Add runtime schemas for mutations and imports.
4. Extract pure scoring and lifecycle types.
5. Remove suppressions from assessment paths before cosmetic legacy pages.

`unknown` should remain at external boundaries and be narrowed; replacing every `any` with `unknown` without validation would not improve correctness.

## 14. Error Handling Review

There are no application error boundaries. Most actions expose raw database messages or generic strings. Console calls have no structured context. Retry behavior is absent from live operations, while simulated assessment UI claims retry behavior.

Define domain errors (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `VALIDATION`, `RATE_LIMITED`, `DEPENDENCY_FAILED`) and map them at Server Action/API boundaries. Log internal context server-side; return actionable, non-sensitive messages to users.

## 15. Dependency Review

- Next.js was upgraded to 16.2.10 during security remediation.
- Unused `react-icons` and `svix` were removed.
- Remaining direct packages are referenced.
- `chart.js`/`react-chartjs-2`, `react-quill-new`, `country-state-city` and `csv-parse` should be isolated behind lazy-loaded feature boundaries.
- Quill 2.0.3 retains a low-severity HTML-export advisory; rich-text output requires sanitization regardless of package upgrades.
- Remaining npm audit state: 3 findings, zero high or critical.

## 16. Code Smell Report

| Smell | Evidence | Effect |
|---|---|---|
| Fat actions | Up to 355 lines per action file | Business rules cannot be isolated or tested |
| God components | Two routes above 1,300 lines | High regression and render risk |
| Primitive obsession | Roles/statuses/types repeated as strings | Drift between SQL, UI and logic |
| Shotgun persistence | 99 direct-query files | Schema changes touch many modules |
| Boolean/JSON configuration | Extensive JSONB metadata/settings | Weak validation and unclear ownership |
| Manual compensation | Delete-on-failure patterns | Partial state under concurrency |
| Placeholder abstractions | Provider registries without composition | Architecture appears more complete than runtime |
| Broad cache invalidation | Revalidate `/` or whole sections | Unnecessary load and stale-state ambiguity |
| Magic defaults | Marks, timeouts and labels inline | Policy changes require code edits |

## 17. Refactoring Roadmap

### Milestone 0 — shared authorization and error boundaries

- Consolidate repeated role guards.
- Add standardized forbidden/not-found/error surfaces.
- Preserve existing redirects and action signatures.
- Risk: low.

### Milestone 1 — assessment domain seam

- Extract scoring, attempt lifecycle and release-policy rules into pure typed modules.
- Add unit tests before moving persistence.
- Risk: medium.

### Milestone 2 — tenant-scoped repositories

- Generate DB types and introduce repositories for assessments, question bank and people.
- Require organization context at construction.
- Add RLS integration tests.
- Risk: high; incremental per feature.

### Milestone 3 — transactional use cases

- Move publish, submit, grading release, import and destructive admin workflows into transactional RPC/application services.
- Add idempotency and audit emission.
- Risk: high.

### Milestone 4 — component decomposition

- Split the two largest pages and render-time components.
- Lazy-load rich editors and charts.
- Standardize accessible dialogs/forms/empty states.
- Risk: medium.

### Milestone 5 — enforce engineering gates

- Zero lint errors.
- Unit/integration/E2E suites.
- Complete schema bootstrap and migration checks.
- CI build, test, audit and bundle budgets.
- Risk: low per change, significant total effort.

## First Implementation Milestone

Replace duplicated route-layout role checks with one tested server-only guard while preserving current role lists and redirect behavior. Reformat affected layouts so authorization is reviewable. This reduces policy drift without changing public APIs, database access or feature behavior.

## Remediation Log

### Milestone 0 — shared dashboard authorization

- Added `requireDashboardRole`, built on the existing server-only `requireRole` boundary.
- Distinguished unauthenticated and forbidden failures without changing user-facing redirects.
- Replaced repeated Supabase profile queries and role arrays in eight protected layout branches.
- Removed a redundant nested super-admin query from the operations layout; the parent admin layout remains authoritative.
- Preserved every existing role allowlist.
- Targeted lint passed, no duplicate layout profile-role guards remain, and the production build generated all 95 routes.
