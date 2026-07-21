# Test Explorer Assessment Builder — Implementation Plan

## 1. Updated database schema

The school Assessment Builder uses new tenant-scoped tables. Legacy `exams`, `practice_tests`, `mock_tests`, and `exam_attempts` remain untouched because existing competitive-exam routes depend on them.

| Table | Responsibility |
|---|---|
| `assessment_types` | Configurable organization assessment types with stable system keys |
| `assessments` | Canonical assessment identity, academic context, owner, lifecycle, blueprint and delivery settings |
| `assessment_sections` | Ordered paper sections with optional instructions and limits |
| `assessment_questions` | Ordered references to approved Question Bank items plus marks snapshot |
| `assessment_assignments` | Availability window and delivery policy for an assessment publication |
| `assessment_assignment_sections` | Assignment to one or more school sections |
| `assessment_assignment_students` | Explicit inclusion/exclusion of individual students |
| `assessment_templates` | Reusable blueprint/settings snapshot without duplicating questions by default |
| `assessment_status_history` | Append-only lifecycle audit trail |
| `assessment_notification_events` | Durable outbox for future Student Assigned, Teacher Published, and Reminder delivery |

Scale and integrity:

- All high-volume indexes start with `organization_id`.
- Questions are referenced, never copied; marks and revision number are snapshotted to preserve published-paper meaning.
- Assignments are separate from assessment authoring, allowing rescheduling without rewriting the paper.
- Publication requires server-side validation and an atomic status transition.
- JSONB is used only for configurable blueprint/delivery policies and future extension points.
- Attempt, response, grading, analytics, AI generation, and proctoring tables are explicitly deferred.

## 2. Route structure

```text
/dashboard/assessments                         management library
/dashboard/assessments/new                     six-step builder
/dashboard/assessments/[assessmentId]          overview
/dashboard/assessments/[assessmentId]/edit     resume builder
/dashboard/assessments/[assessmentId]/questions split-screen paper builder
/dashboard/assessments/templates               reusable templates
```

## 3. Component hierarchy

```text
AssessmentLibraryPage
└─ AssessmentLibrary
   ├─ LibraryHeader
   ├─ StatusTabs
   ├─ SearchFilters
   ├─ AssessmentTable
   └─ RowActions

AssessmentBuilderPage
└─ AssessmentWizard
   ├─ BuilderHeader + AutosaveState
   ├─ WizardProgress
   ├─ BasicDetailsStep
   ├─ BlueprintStep
   │  └─ DifficultyMix + TypeMix + PassingRules
   ├─ BuildPaperStep
   │  └─ QuestionSelectionWorkspace
   │     ├─ QuestionLibraryPane
   │     └─ AssessmentPaperPane
   ├─ AssignmentStep
   ├─ DevicePreviewStep
   └─ PublishSummaryStep

AssessmentDetailPage
└─ DetailTabs: Overview / Sections / Students / Questions / Settings / History
```

## 4. Wizard flow

1. **Basic Details** — title, description, configurable type, academic year, subject, grade, sections, teacher.
2. **Blueprint** — total marks, duration, difficulty/type targets, negative marking, pass criteria, instructions.
3. **Build Paper** — manual Question Bank selection, collection, or deterministic filtered random selection. AI is visible but disabled.
4. **Assignment** — sections and individual students, availability, attempts, shuffle, result/answer release, calculator, fullscreen, late policy.
5. **Preview** — exact student paper chrome at desktop/tablet/mobile widths.
6. **Publish** — validation findings, immutable summary, save draft/schedule/publish choice.

Draft autosave occurs after valid Step 1 identity exists. URL step state makes the workflow resumable. Every step can be revisited before publication.

## 5. Assessment lifecycle

```text
draft ──schedule──> scheduled ──window opens──> active ──window closes──> completed
  └────publish now────────────────────────────> active
draft/scheduled/published/completed ──────────> archived
scheduled ──cancel publication────────────────> draft
```

`published` represents a released paper without an open attempt window; the scheduler moves it to `active`. Each transition writes `assessment_status_history`. Editing question membership after release creates a future revision instead of silently changing a live paper.

## 6. Assignment lifecycle

Draft assignment → validated recipients → scheduled/published → active → closed. Recipient resolution combines assigned sections with explicit student inclusions/exclusions. Publication writes notification-outbox events in the same transaction; delivery is intentionally deferred.

## 7. Blueprint validation logic

Blocking errors:

- No questions or unapproved Question Bank items.
- Question marks do not equal blueprint total.
- No recipients, invalid availability window, or due date before start.
- Question type has no valid answer specification.
- Duplicate question references.

Warnings:

- Difficulty distribution differs from target by more than 10 percentage points.
- No `analyze`, `evaluate`, or `create` Bloom-level question.
- Configured chapters have no coverage.
- A single question carries over 25% of marks.
- Question count is unusually high for duration using estimated-time totals.
- Negative marking is enabled for constructed-response types.

Suggestions are deterministic and explain the evidence; they never prevent saving a draft.

## 8. Migration plan

1. Apply Phase 1 and Question Bank migrations first.
2. Apply the additive Assessment Builder migration.
3. Seed default types idempotently for each organization through an onboarding/admin action.
4. Generate Supabase database types.
5. Verify teacher/admin tenant RLS and confirm students cannot read authoring tables.
6. Connect repository/actions, then enable management and wizard persistence.
7. Introduce an explicit legacy assessment importer later; never reinterpret legacy rows in place.

Rollback disables new routes and removes only the new assessment tables. Existing exams and attempts remain operational.

## 9. Development checklist

### Foundation milestone

- [x] Additive scalable schema and RLS
- [x] Feature-based routes and domain types
- [x] Assessment management table with honest empty state
- [x] Six-step premium wizard shell
- [x] Split-screen Question Bank/paper workspace
- [x] Blueprint validation presentation
- [x] Desktop/tablet/mobile preview modes
- [x] Detail page and tab structure
- [x] Template and notification extension points
- [ ] Apply migration and generate database types

### Persistence milestone

- [ ] Tenant-scoped assessment repository with keyset pagination
- [ ] Create/update/autosave server actions with optimistic concurrency
- [ ] Question Bank selection and ordering persistence
- [ ] Assignment recipient resolver
- [ ] Status transition service and notification outbox transaction
- [ ] Duplicate, archive, delete-draft, and save-template actions

### Workflow milestone

- [ ] URL-backed filters and status tabs
- [ ] Keyboard-accessible drag-and-drop
- [ ] Collection and filtered-random question selection
- [ ] Server-authoritative blueprint validator
- [ ] Exact student preview renderer shared with delivery
- [ ] Export blueprint and import placeholder

### Hardening

- [ ] Cross-tenant and role authorization verification
- [ ] Autosave conflict/recovery UX
- [ ] Publish concurrency/idempotency checks
- [ ] Accessibility and mobile QA
- [ ] Load validation for large question libraries and recipient lists
