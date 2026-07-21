# Test Explorer Teacher Evaluation Workspace — Implementation Plan

## 1. Updated schema

The evaluation domain extends `assessment_attempts` and `assessment_attempt_responses`; it does not create competing score or answer records.

| Table | Purpose |
|---|---|
| `rubrics` | Organization-owned reusable rubric identity and visibility |
| `rubric_criteria` | Ordered criteria, descriptions and maximum marks |
| `assessment_question_rubrics` | Assigns one rubric to an assessment question |
| `manual_grades` | One teacher grade per attempt response with score, feedback, revision and review state |
| `attempt_feedback` | Structured overall, positive, improvement and private feedback |
| `feedback_templates` | Reusable organization/teacher feedback snippets |
| `assessment_review_state` | Attempt-level queue status, reviewer, comment state and completion timestamps |
| `assessment_question_metrics` | Materialized question aggregates from real submitted attempts |
| `assessment_metrics` | Materialized assessment/class aggregates from real submitted attempts |
| `evaluation_events` | Append-only audit and notification outbox for feedback/release/review events |

Authoritative totals are recalculated from response grades. Aggregate tables are derived caches with `calculated_at`, `source_attempt_count`, and a calculation version; they are never hand-edited or treated as source data.

## 2. Route structure

```text
/dashboard                              personalized teacher home
/dashboard/evaluation                   attention queue
/dashboard/assessments/[id]/results     results workspace
/dashboard/assessments/[id]/results/submissions
/dashboard/assessments/[id]/results/questions
/dashboard/assessments/[id]/results/class
/dashboard/assessments/[id]/results/release
/dashboard/evaluation/[attemptId]/grade manual grading
/dashboard/rubrics                      reusable rubrics
/dashboard/rubrics/new
/dashboard/rubrics/[rubricId]
/dashboard/students/[studentId]/performance
```

## 3. Teacher workflow

Teacher home → attention queue → assessment results → filter submissions needing review → grade constructed responses → add feedback → complete review → verify release readiness → release selected/all or schedule → return to class/question analysis → decide the next teaching action.

The first screen prioritizes actionable counts and deadlines. Analytics appear only after real submitted attempts exist.

## 4. Grading workflow

1. Open the oldest unreviewed submitted attempt.
2. Navigate only responses requiring manual grading.
3. Read question, student answer, optional previous answer and assigned rubric together.
4. Score criteria or enter a bounded score; add question feedback/private note.
5. Autosave with an optimistic revision.
6. Use keyboard shortcuts for save, previous/next response and focus score.
7. Complete the attempt review; totals recalculate transactionally.
8. Add overall feedback and optionally release according to policy.

Automated and manual scoring converge through one grade-total service. Future AI can propose scores/comments but cannot bypass teacher confirmation.

## 5. Rubric model

A rubric is reusable within an organization and optionally private to its owner. Criteria are ordered and contain name, description and maximum marks. Assignment occurs at `assessment_questions`, not at canonical Question Bank items, because evaluation expectations may differ per assessment. Published rubrics are snapshotted through assessment revision semantics.

## 6. Analytics model

All metrics include an explicit denominator and calculation timestamp.

- Assessment: eligible students, submitted attempts, submission rate, mean, median, minimum, maximum, completion and release counts.
- Question: attempts, correct/incorrect/skipped counts, percentages, average awarded marks/time, common wrong option counts.
- Topic/chapter/difficulty: weighted rollups over assessment questions.
- Student: assessment history and real topic performance; strengths/weaknesses require a documented minimum evidence threshold.
- Discrimination, growth and interventions remain placeholders until sample size and longitudinal requirements are defined.

## 7. Component hierarchy

```text
TeacherDashboard
├─ AttentionSummary
├─ TodayAssessments
├─ ReviewQueue
├─ ClassesRequiringAttention
├─ UpcomingAssessments
└─ Activity / Announcements

ResultsWorkspace
├─ ResultsHeader + ReleaseState
├─ ResultMetricCards
├─ WorkspaceTabs
├─ SubmissionTable
├─ QuestionAnalysisTable
└─ ClassPerformanceEmptyOrRealData

ManualGradingWorkspace
├─ StudentNavigator
├─ QuestionAndAnswerPanel
├─ RubricScoringPanel
├─ FeedbackEditor
├─ AutosaveState
└─ Previous / Next controls
```

## 8. Migration plan

1. Apply Phase 1–4 migrations.
2. Apply the additive evaluation migration and regenerate database types.
3. Verify tenant and teacher assignment authorization.
4. Backfill `assessment_review_state` for submitted constructed-response attempts.
5. Calculate metrics in batches from real attempts and compare with direct SQL samples.
6. Enable grading persistence, then release actions and exports.
7. Keep legacy competitive-exam results unchanged; migrate only through an explicit adapter later.

## 9. Development checklist

### Foundation milestone

- [x] Additive rubric, feedback, manual-grade, review and metric schema
- [x] Personalized work-first teacher dashboard
- [x] Evaluation queue and navigation entry
- [x] Results workspace with overview, submission and analysis surfaces
- [x] Manual grading interface and autosave-state contract
- [x] Rubric library/editor shells
- [x] Result-release controls and export extension points
- [x] Student performance shell with evidence-aware empty states
- [ ] Apply migration and regenerate Supabase types

### Persistence milestone

- [ ] Teacher-scoped attention/result repositories
- [ ] Revision-aware manual-grade autosave action
- [ ] Rubric CRUD and assessment-question assignment
- [ ] Attempt completion and authoritative score recalculation
- [ ] Feedback/template persistence
- [ ] Release selected/all/hide/republish/schedule transaction
- [ ] Evaluation notification events

### Analytics milestone

- [ ] Versioned aggregate calculation service
- [ ] Question option and response-time aggregation
- [ ] Chapter/topic/difficulty rollups
- [ ] CSV export and PDF/Excel adapters
- [ ] Evidence thresholds for strengths and weak topics

### Hardening

- [ ] Cross-tenant and teacher-assignment authorization checks
- [ ] Concurrent grading conflict recovery
- [ ] Release idempotency and audit verification
- [ ] Keyboard and screen-reader grading QA
- [ ] Large-class table and aggregate load validation
