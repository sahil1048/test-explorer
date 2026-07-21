# Test Explorer Product and UX Audit

Audit date: 2026-07-21

## 1. Executive Summary

Test Explorer presents a broad school assessment vision but does not currently deliver a complete school workflow. The application mixes three products: a legacy competitive-exam/content platform, a school assessment SaaS shell, and a platform operations shell. The school-facing navigation promises question banks, assessment delivery, evaluation, intelligence, communication, parent access and billing, but many visible controls are placeholders or local-only demonstrations.

**Customer verdict: a school should not buy or onboard onto this version.** A guided sales demo could communicate the intended direction, but a teacher cannot create, deliver, grade and release a school assessment end-to-end without engineering work.

The product’s clearest potential identity is **Assessment Intelligence for Schools**: one workflow from reusable questions to assessment delivery, teacher action and principal intervention. It should not present itself as a full LMS, competitive-exam portal or generic communication suite.

Runtime visual testing was not possible because no browser backend was available. Responsive, focus, contrast and cross-browser conclusions below are therefore source-level findings requiring device validation.

## 2. Overall Product Score

**2.4/10**

| Area | Score | Evidence |
|---|---:|---|
| Product clarity | 3/10 | School assessment positioning is diluted by “My Courses”, mock tests, rank prediction, streams and legacy content. |
| Teacher experience | 2/10 | Creation surfaces exist, but question, assessment, evaluation and communication persistence is incomplete. |
| Student experience | 3/10 | The assessment player is calm and mobile-aware, but autosave and submit are simulated. |
| Principal experience | 2/10 | The command-center framing is appropriate, but all decision metrics are empty shells. |
| Parent experience | 2/10 | Read-only intent is correct; child linking and data retrieval are not connected. |
| School administration | 3/10 | Profile editing exists; people, permissions, subscriptions and operational settings are incomplete. |
| Usability consistency | 4/10 | New modules share a visual language; legacy screens and controls remain inconsistent. |
| Accessibility | 3/10 | Some assessment ARIA support exists, but dialog focus, labelling and automated verification are missing. |
| Commercial readiness | 1/10 | No complete adoption-to-results workflow is available. |

## 3. Product Map and Navigation

```text
Public
├─ Marketing, blogs, contact, policies
├─ Legacy categories / courses / competitive exams
└─ Login, signup, password recovery

School workspace
├─ School foundation: academics and people
├─ Question bank
├─ Assessments
├─ Evaluation
├─ Principal intelligence
├─ Communication and calendar
└─ Settings and operations

Student workspace
├─ Dashboard
├─ Legacy My Courses
├─ Assigned assessments
├─ Updates
└─ Calendar

Parent workspace
├─ Family dashboard
├─ Updates
├─ Calendar
└─ Preferences

Platform workspace
├─ SaaS operations and schools
├─ Legacy competitive-exam content
└─ Marketing/growth content
```

### Navigation findings

- Teachers and school administrators receive the same `schoolWorkspace` navigation in `lib/dashboard/navigation.ts`. Teachers see **Intelligence** even though its layout permits only school and super admins, producing a redirect dead end.
- Teachers also see **Operations & Billing**, although the destination permits only school and super admins.
- Students see **My Courses**, a legacy learning/competitive-exam concept that conflicts with the stated school assessment focus.
- The dashboard header displays a clickable “Search workspace” control with a keyboard shortcut, but it has no behavior.
- Communication shows compose, templates and delivery-history shortcuts to students and parents even though staff guards reject them.
- Page-title generation uses the last URL segment; dynamic resource pages can display opaque IDs as the title.
- The platform navigation correctly labels old functionality “Legacy content”, but the public and student experiences still expose legacy concepts.

## 4. Role-by-role Review

### Teacher — 2/10

The intended daily loop is understandable: Dashboard → Question Bank → Assessments → Evaluation. In practice:

- `teacher-overview.tsx` presents useful categories but not a persisted work queue.
- The Question Bank offers strong metadata concepts, but editor/import/library controls are presentation-first and incomplete.
- The assessment wizard is visually structured but does not create a durable assessment workflow.
- Evaluation presents “0” queues and locally simulated grading autosave.
- Intelligence and billing links lead teachers to authorization redirects.
- Communication invites teachers to publish, but the composer has no persistence.

Primary frustration: the interface repeatedly offers a credible action and then cannot complete it.

### Student — 3/10

The assessment player has the best interaction model in the school product: quiet colors, sticky timer, question palette, bookmarks, large-text control and connectivity messaging. However:

- Assigned Assessments receives an empty array by default.
- Assessment details and preflight are not backed by assignment state.
- “Saving…” is a timer simulation rather than durable autosave.
- Confirm submission navigates to a confirmation route without committing answers.
- The confirmation page explicitly says a persisted reference will appear later.
- Results are a static “not released” state.
- Legacy My Courses distracts from the work-focused dashboard goal.

The student experience communicates safety without providing it, which is more damaging than omitting the claim.

### Principal — 2/10

The information architecture correctly asks “what needs attention?”, but the command center cannot answer it. Health cards, teacher insights, risk flags, trends and reports are empty states. No widget offers a real drill-down from evidence to action. This is not vanity analytics; it is currently no analytics.

### Parent — 2/10

The portal uses appropriate read-only language and avoids unnecessary controls. Nevertheless, the child switcher does nothing, verified guardian links are not loaded, and all cards are static. Parent navigation exposes staff communication shortcuts through the shared Communication Center.

### School administrator — 3/10

Basic school settings and legacy platform administration exist. Academic structure and people pages are mostly foundation cards. Subscriptions, license utilization, integrations, feature flags and audit controls are empty operational shells. The setup requires knowledge of product phases and database migrations—language that must never appear in customer-facing UI.

## 5. Workflow Review

| Workflow | Current experience | Main friction | Status |
|---|---|---|---|
| School onboarding | Seven-step wizard | Inputs are not persisted; completion claims readiness; student import says “coming next” | Blocked |
| Teacher invitation | Onboarding input | No invite action or lifecycle UI | Blocked |
| Student invitation/import | Placeholder upload | No preview, validation or import | Blocked |
| Question creation | Rich editor shell | Save/validation/repository workflow incomplete | Blocked |
| Question editing/deletion | Routes and library actions | No dependable persisted workflow | Blocked |
| Question import | Wizard shell | Import execution remains incomplete | Blocked |
| Assessment creation | Six-step builder | Local wizard; no complete persistence/publish transaction | Blocked |
| Assignment | Builder step | No recipient-resolution or assignment confirmation | Blocked |
| Student assessment | Reusable player shell | Local answers and simulated autosave | Critical blocker |
| Submission | Confirmation link | No transactional or idempotent submission | Critical blocker |
| Manual grading | Workspace shell | “Saved locally”; no response loaded | Blocked |
| Feedback/results | Static panels | No release workflow | Blocked |
| Analytics | Empty snapshots | No calculated metrics | Blocked |
| Notifications | Dummy notification center | No real repository/delivery state | Blocked |
| Announcements | Legacy announcement path works partially | Duplicate legacy/new communication concepts | Fragmented |
| Parent portal | Static read-only shell | No verified child data | Blocked |
| Billing | Operations cards | No usable customer workflow | Blocked |
| Settings | Basic organization form | Operational settings fragmented between two routes | Partial |

## 6. Design System Review

### Consistent newer patterns

- Rounded 2xl/3xl cards
- Slate/gray surfaces and restrained blue emphasis
- Small uppercase eyebrow labels
- Honest dashed empty states
- Responsive grid primitives
- Dark-mode variants

### Inconsistencies

- Legacy pages use black buttons, gray cards, different radii and unrelated terminology.
- Inputs range from shared `Input` to repeated `editor-input` and long inline class strings.
- Confirmation patterns vary between Radix alert dialogs, custom fixed overlays and plain navigation links.
- Tables, filters, empty states and search bars are reimplemented in individual features.
- New feature files are compressed into single-line components, making interaction states difficult to inspect and maintain.
- Icon-only controls do not consistently include accessible names.

Recommended primitives: `PageHeader`, `WorkspaceTabs`, `FilterBar`, `DataTable`, `EmptyState`, `StatusBadge`, `ConfirmAction`, `SaveStatus`, `PermissionGate`, and a focus-managed `ResponsiveDialog`.

## 7. Responsiveness Review

Source patterns show intentional breakpoints and mobile layouts in newer modules. The assessment player has a mobile palette and compact header. Risks requiring browser verification include:

- Long multi-column legacy admin editors.
- Tables without explicit mobile alternatives.
- Custom dialogs using fixed overlays without height/keyboard handling.
- Horizontal filter rows that rely on overflow scrolling without visible affordance.
- A fixed 17rem sidebar and sticky headers interacting with landscape tablets.
- Assessment controls near mobile viewport/virtual-keyboard boundaries.

## 8. Accessibility Review

- Positive: assessment save/timer announcements use live regions; some dialogs use `role="dialog"`; assessment touch targets are generally large.
- Critical: dialogs do not demonstrate focus trapping, initial focus, Escape behavior or focus restoration.
- Several close/menu/bookmark controls lack complete accessible state such as `aria-pressed` or expanded state.
- Form errors are not consistently associated with fields or summarized.
- The shell has no skip-to-content link.
- Inert search controls remain keyboard focusable.
- Color contrast and zoom/reflow cannot be certified without browser measurement.

## 9. Micro UX and Content Review

The strongest content pattern is explicit refusal to invent analytics. The weakest pattern is exposing internal roadmap language to customers:

- “Phase 1 database”
- “next incremental milestone”
- “provider orchestration is not configured”
- “connect with persistence”
- “prepared as a placeholder”

These messages are appropriate for development review, not for a paying school. Empty states should explain the user action needed, not implementation history.

Confidence failures include:

- “Saved” for local-only state
- “Your work is safe” without persistence
- Buttons that look active but do nothing
- Disabled controls without an explanation or eligibility condition
- Redirects rather than an inline permission explanation
- No confirmation reference after assessment submission

## 10. Product Gaps

The product needs fewer visible promises, not more modules. The commercially necessary sequence is:

1. Persist school structure and roster onboarding.
2. Make Question Bank CRUD/import complete.
3. Make assessment creation/assignment complete.
4. Guarantee student autosave and submission.
5. Make grading, release and feedback complete.
6. Calculate only the analytics needed to guide reteaching.
7. Add parent and principal surfaces after underlying evidence exists.

Communication, productivity AI, principal intelligence, billing dashboards and platform operations should not appear as usable modules until their core action succeeds.

## 11. Competitive Positioning

Test Explorer’s potential advantage is a narrower school-assessment workflow with question reuse and evidence-driven reteaching. It currently loses on reliability, integrations, onboarding and workflow completion:

- [Google Classroom](https://edu.google.com/workspace-for-education/products/classroom/made-for-teaching/) emphasizes quick setup, automatic teacher/student work queues, reusable rubrics, offline capability and roster import.
- [Microsoft Teams for Education](https://support.microsoft.com/en-us/education/view-and-navigate-your-assignments-educator) organizes teacher work into Upcoming, Ready to Grade, Past Due, Returned and Draft states; Test Explorer’s evaluation and dashboard queues are not connected.
- [Canvas](https://www.instructure.com/canvas) differentiates with SpeedGrader, gradebook visibility, targeted messaging and a mature integration ecosystem.
- [Mastery](https://www.instructure.com/mastery) connects standards-aligned assessments directly to intervention and reteaching decisions—the closest match to Test Explorer’s intended differentiation.
- ClassDojo is stronger for family communication and read visibility; Test Explorer should not compete as a generic messaging product.

Test Explorer should compete on: fast school assessment creation, trustworthy delivery, reusable question intelligence, and a short path from “weak topic” to “reteach action.” It should integrate with LMS/communication products rather than imitate their full scope.

## 12. Friction Analysis

1. Too many top-level modules before the primary workflow works.
2. Role-inappropriate navigation creates redirect dead ends.
3. Legacy and school terminology coexist.
4. Customer-facing copy exposes implementation phases.
5. Active-looking controls are inert.
6. Empty states often describe future system behavior rather than a next action.
7. Save, publish and submit states are not trustworthy.
8. No persistent onboarding progress or task checklist exists.
9. No contextual help is available.
10. Settings are fragmented between `/dashboard/settings`, `/dashboard/school-settings` and `/dashboard/school-settings/operations`.

## 13. Prioritized Improvement Backlog

### P0 — before any school pilot

| Improvement | Effort | Expected business impact |
|---|---:|---|
| Remove or label every nonfunctional action and module | 2–4 days | Prevents broken promises during evaluation |
| Make navigation permission-aware | 0.5 day | Removes role dead ends and support requests |
| Replace simulated assessment save/submit language | 0.5 day immediately; durable workflow is larger | Prevents loss-of-work trust failure |
| Complete one onboarding → assessment → grading path | 4–8 weeks | Enables a meaningful school pilot |
| Remove internal phase/placeholder language | 1–2 days | Makes the product customer-facing |

### P1 — pilot quality

| Improvement | Effort | Expected business impact |
|---|---:|---|
| Persistent role-specific work queues | 1–2 weeks | Reduces daily teacher navigation time |
| Unify settings and communication entry points | 2–4 days | Lowers administrative confusion |
| Standardize dialogs, forms, tables and feedback | 1–2 weeks | Improves learnability and accessibility |
| Add contextual setup/help links to empty states | 2–3 days | Reduces onboarding support |
| Validate mobile assessment flow and keyboard UX | 3–5 days | Reduces assessment abandonment |

### P2 — adoption quality

- Saved filters and recent work: 3–5 days.
- Proper breadcrumbs/resource titles: 2–3 days.
- Parent child-switching and notification preference clarity: 1 week after data is connected.
- Principal drill-down consistency: 1–2 weeks after metrics exist.
- Accessibility remediation and automated scans: 1–2 weeks.

### P3 — polish

- Motion and hover normalization: 2–3 days.
- Advanced mobile table transformations: 3–5 days.
- Optional user-controlled density: 3–5 days.
- Guided walkthroughs after workflows stabilize: 1 week.

## First Improvement Milestone

Without redesigning the product:

1. Filter navigation by role so users see only destinations they may access.
2. Remove the inert global-search control until search works.
3. Restrict staff communication shortcuts and compose actions to staff.
4. Remove legacy “My Courses” from the school student navigation.
5. Add correct icons and accessible expanded/current states to the shell.
