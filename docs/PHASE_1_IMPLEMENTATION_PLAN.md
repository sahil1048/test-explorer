# Test Explorer Phase 1 Implementation Plan

## 1. Implementation principles

Phase 1 evolves the current Next.js, Supabase, Tailwind, and shadcn application in place.

- Preserve Supabase authentication, `profiles`, `organizations`, path-based school portals, school branding, the existing dashboard layout, and the current student experience.
- Add the school operating model before replacing legacy competitive-exam catalog tables.
- Use additive migrations first. Backfill and dual-read during transition; remove legacy concepts only after data validation and feature parity.
- Keep `/dashboard/admin/*` available to super admins while the school workspace is introduced under `/dashboard/*`.
- Build only foundations for Assessments and Analytics in Phase 1: navigation, permissions, empty states, and future route contracts.
- Every milestone must build successfully and preserve login, tenant branding, school admin, student, and super-admin entry points.

## 2. Delivery milestones

### Milestone 1 — Foundation shell and domain model

- Add the Phase 1 schema migration and future-safe role/permission types.
- Replace the flat school-admin sidebar with grouped navigation.
- Add mobile navigation, premium header, breadcrumbs, theme control, and notification center with dummy data.
- Replace fake school metrics with honest counts and empty states.
- Add safe route foundations for Academics, People, Assessments, Analytics, Communication, and Settings.

### Milestone 2 — Organization and academic years

- Expand organization settings for code, address, contact, domain, branding, locale/time zone, and onboarding status.
- Build academic-year CRUD with current/future/archive states.
- Add “set current year,” archive, and future promotion planning without deleting history.

### Milestone 3 — Grades, sections, and subjects

- Build grade ordering and school-specific display names.
- Build sections scoped to academic year and grade.
- Build organization subjects and section subject offerings.
- Add teacher assignment placeholders without assessment behavior.

### Milestone 4 — People

- Add school-admin and teacher management, status filters, invite lifecycle, profile details, assignments, and activity feed.
- Evolve the existing student directory into grade/section-aware roster management.
- Add future-parent placeholder and relationships without exposing a parent workspace.

### Milestone 5 — Onboarding

- Add resumable seven-step onboarding.
- Persist each completed step and allow safe return.
- Finish by routing to a truthful school dashboard with next actions.

### Milestone 6 — Hardening and transition

- Complete row-level permission policies and role-matrix validation.
- Backfill existing school/profile data.
- Add audit events for administrative changes.
- Remove temporary dummy notification data when notification producers exist.

## 3. Updated folder structure

```text
app/
  dashboard/
    layout.tsx
    page.tsx
    academics/
      page.tsx
      academic-years/page.tsx
      grades/page.tsx
      sections/page.tsx
      subjects/page.tsx
    people/
      page.tsx
      teachers/page.tsx
      students/page.tsx
    assessments/page.tsx        # Phase 1 placeholder
    analytics/page.tsx          # Phase 1 placeholder
    communication/
      page.tsx
      announcements/page.tsx    # transition from current route
    settings/page.tsx
    onboarding/page.tsx
    admin/                       # retained legacy super-admin workspace
components/
  dashboard/
    shell/
      dashboard-sidebar.tsx
      dashboard-header.tsx
      mobile-navigation.tsx
      notification-center.tsx
      theme-toggle.tsx
    overview/
      school-overview.tsx
      quick-actions.tsx
      activity-list.tsx
      academic-overview.tsx
    empty-state.tsx
    page-header.tsx
    stat-card.tsx
  academics/
  people/
  onboarding/
  ui/                            # existing shadcn primitives retained
lib/
  auth/
    permissions.ts
    roles.ts
  dashboard/
    navigation.ts
  domain/
    academic.ts
    organization.ts
    people.ts
    notification.ts
  supabase/
    client.ts
    server.ts
    database.types.ts            # generated after migration application
supabase/
  migrations/
    202607200001_phase_1_school_foundation.sql
docs/
  PHASE_1_IMPLEMENTATION_PLAN.md
```

Feature folders will be introduced only when their functionality is implemented. Existing files are moved gradually to avoid a high-risk bulk rename.

## 4. Updated database schema

### Existing tables retained

- `organizations`: canonical school tenant. Add `school_code`, domains/contact/address/branding/settings/onboarding fields rather than creating a second school table.
- `profiles`: canonical person identity linked to Supabase Auth. Add `avatar_url`, `status`, activity fields, and role constraint support.
- `school_announcements`: retained as the communication foundation.
- Existing competitive-exam/content/attempt tables remain untouched in Phase 1.

### New tables

| Table | Purpose | Key relationships |
|---|---|---|
| `academic_years` | Current, future, and archived school years | organization → years |
| `grades` | Organization-specific grades with sort order | organization → grades |
| `sections` | Grade sections for a specific academic year | year + grade → sections |
| `organization_subjects` | School subject catalog | organization → subjects |
| `section_subjects` | Subjects offered to a section | section + subject |
| `profile_assignments` | Person assignment to grade/section/subject/year | profile + organization + optional academic entities |
| `organization_invites` | Staff/student invitation lifecycle | organization + inviter + role |
| `notifications` | Durable in-product notifications | recipient profile + organization |
| `organization_events` | Upcoming event foundation | organization + academic year |
| `audit_events` | Administrative activity foundation | organization + actor |
| `onboarding_progress` | Resumable seven-step onboarding | one row per organization |

### Roles and permissions

Canonical roles are `super_admin`, `school_admin`, `teacher`, and `student`. `parent` is reserved for future migration but not enabled as an interactive role in Phase 1.

Application permissions use stable capabilities such as `organization.manage`, `academics.manage`, `people.manage`, `announcements.manage`, `assessments.view`, and `analytics.view`. Roles map to capabilities centrally; future custom roles can add a role/permission table without changing page contracts.

### Core constraints

- School codes and canonical domains are case-insensitively unique.
- Only one current academic year may exist per organization.
- Grade names/codes are unique per organization.
- Section names are unique per academic year and grade.
- Subject codes are unique per organization when provided.
- A profile assignment is unique across person/year/grade/section/subject/role.
- Tenant-owned records always include `organization_id` and are protected by tenant-aware policies.

## 5. Component hierarchy

```text
DashboardLayout
├── DashboardSidebar
│   ├── OrganizationBrand
│   ├── GroupedNavigation
│   └── UserSummary
├── MobileNavigation
├── DashboardHeader
│   ├── Breadcrumbs
│   ├── ThemeToggle
│   ├── NotificationCenter
│   └── UserNav
└── RouteContent
    ├── PageHeader
    ├── QuickActions
    ├── SummaryCard / EmptyState
    ├── DataTable foundation
    └── Dialog/Form foundation
```

```text
OnboardingWizard
├── ProgressHeader
├── SchoolDetailsStep
├── AcademicYearStep
├── GradesStep
├── SectionsStep
├── InviteTeachersStep
├── ImportStudentsStep (placeholder)
└── FinishStep
```

## 6. Route structure

### School workspace

- `/dashboard` — honest school overview for school admins/teachers; existing student overview retained.
- `/dashboard/academics` — academic structure summary.
- `/dashboard/academics/academic-years`
- `/dashboard/academics/grades`
- `/dashboard/academics/sections`
- `/dashboard/academics/subjects`
- `/dashboard/people` — people summary.
- `/dashboard/people/teachers`
- `/dashboard/people/students` — canonical destination; existing `/dashboard/students` retained during transition.
- `/dashboard/assessments` — Phase 1 placeholder only.
- `/dashboard/analytics` — Phase 1 placeholder only.
- `/dashboard/communication`
- `/dashboard/communication/announcements` — future canonical route; existing `/dashboard/announcements` retained.
- `/dashboard/settings` — organization settings hub; existing `/dashboard/school-settings` retained.
- `/dashboard/onboarding` — resumable setup wizard.

### Super-admin workspace

`/dashboard/admin/*` remains intact in Phase 1. A later milestone will reorganize its navigation without removing operational capabilities.

## 7. UI wireframe descriptions

### Dashboard shell

- **Sidebar:** 272 px desktop rail, white/translucent surface, compact organization mark and school name, grouped labels, 40 px navigation rows, subtle blue active pill, muted secondary items, user card at bottom.
- **Header:** 64 px sticky bar with breadcrumb/page context on the left; search placeholder, theme, notifications, and avatar on the right.
- **Content:** soft neutral canvas, maximum 1440 px, generous 24–32 px gaps, rounded 16–24 px cards, restrained shadows.
- **Mobile:** compact top bar plus slide-over navigation. No desktop-only inaccessible menu.

### School homepage

- Welcome header with current academic year and onboarding status.
- Quick actions: Add Teacher, Add Student, Configure Academics, Create Announcement.
- Academic Overview: real counts for years/grades/sections/subjects; setup CTA when empty.
- Today’s Activity: recent real audit/user activity or honest empty state.
- Recent Users: last five real organization profiles.
- Announcements: latest real announcements and manage link.
- Upcoming Events: clearly labeled Phase 1 placeholder with “Events are coming next.”
- No performance percentages, rankings, or assessment analytics before those modules exist.

### Academics pages

- Page header with current-year badge and primary action.
- Filterable table/cards depending on density.
- Empty state explains the dependency chain: year → grade → section → subjects.
- Archive/current/future status uses text plus color.

### People pages

- Search, role/status/grade/section filters, invite action, and bulk import placeholder.
- Rows show avatar, name/email, role, status, assignments, last activity, and overflow actions.
- Details open as a dedicated page or wide sheet, not a tiny modal.

### Onboarding

- Focused full-width card with left progress rail on desktop and compact progress on mobile.
- One decision per step, persistent back/continue controls, skip only where explicitly safe.
- Finish screen summarizes created structure and routes to the dashboard.

## 8. Migration strategy

1. Create a production backup and schema snapshot outside this repository before applying migrations.
2. Apply additive organization/profile columns with nullable/default-safe values.
3. Create new academic, assignment, notification, onboarding, and audit tables.
4. Add indexes, constraints, triggers, and tenant policies.
5. Backfill `organizations.school_code` deterministically from existing slug/id; require school review later.
6. Backfill profile status/activity defaults and preserve all existing roles.
7. Create a current academic year only for schools that explicitly complete onboarding; do not guess historical structures.
8. Dual-read legacy student “stream” and new assignments during transition.
9. Move school-admin workflows to new tables one module at a time.
10. Validate row counts and tenant boundaries before making new columns mandatory.
11. Archive, but do not drop, legacy catalog relationships after assessment modules are redesigned in a later phase.

## 9. Breaking changes

No intentional breaking route or data changes occur in Milestone 1.

Planned later changes requiring communication:

- `stream` stops representing a student’s school grade and remains only a legacy competitive-exam attribute.
- School-facing `course/exam/category` navigation is replaced by academic year/grade/section/subject.
- `/dashboard/students`, `/dashboard/announcements`, and `/dashboard/school-settings` transition to grouped canonical routes with redirects after parity.
- Teacher becomes a first-class role; role-aware landing destinations change.
- Organization settings gain required school code/current academic year during onboarding.
- Any future removal of legacy tables requires a separate migration, backup, reconciliation report, and rollback plan.

## 10. Development checklist

### Foundation

- [ ] Add schema migration.
- [ ] Add role/capability types and navigation config.
- [ ] Build grouped desktop/mobile shell.
- [ ] Build notifications dummy infrastructure.
- [ ] Add dark-mode control and dashboard theme styles.
- [ ] Replace fake school overview data.
- [ ] Add Phase 1 route foundations.

### Organization

- [ ] Expand organization settings.
- [ ] Validate school code/domain.
- [ ] Add branding preview.
- [ ] Add organization activity log.

### Academics

- [ ] Academic-year CRUD/current/archive/future.
- [ ] Grade CRUD/order.
- [ ] Section CRUD and grade/year filtering.
- [ ] Subject CRUD and section offerings.
- [ ] Promotion planning workflow.

### People

- [ ] Teacher list/invite/detail/status.
- [ ] School-admin list/invite/detail/status.
- [ ] Student grade/section-aware directory/detail.
- [ ] Profile assignments.
- [ ] Parent placeholder.
- [ ] Activity timeline.

### Onboarding

- [ ] Seven-step UI.
- [ ] Per-step persistence.
- [ ] Resume/back/finish behavior.
- [ ] Teacher invitation.
- [ ] Student import placeholder and template guidance.

### Validation per milestone

- [ ] Existing login/signup/password flows work.
- [ ] Existing school portal branding works.
- [ ] Existing student dashboard/course/test flows remain reachable.
- [ ] Existing super-admin routes remain reachable.
- [ ] Dashboard works on desktop and mobile.
- [ ] New empty states are truthful.
- [ ] Production build succeeds.
- [ ] No unrelated repository changes are included in commits.
