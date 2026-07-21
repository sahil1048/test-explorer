# Principal Intelligence Center — Implementation Plan

## 1. Analytics architecture

The command center reads versioned, reproducible snapshots produced from Phase 3–5 source records. UI components never calculate school KPIs from partial client payloads.

```text
assessments + assignments + attempts + grades + questions
  → versioned aggregation jobs
  → school/dimension/teacher snapshots
  → rule-based risk flags and interventions
  → principal queries, drill-downs and reports
```

Every displayed metric carries period, population, source count, calculation version and timestamp. Empty or stale data is identified explicitly. AI and prediction can later consume the same snapshots but cannot overwrite them.

## 2. Metric definitions

- **School average:** sum of released graded attempt scores ÷ sum of their maximum scores × 100. Attempts without a final grade are excluded and counted separately.
- **Assessment completion:** submitted or timed-out eligible attempts ÷ expected eligible attempts.
- **Participation:** distinct students with a started attempt ÷ distinct assigned eligible students.
- **Time to grade:** median duration from attempt submission to completed review.
- **Subject/grade trend:** current comparable-period average minus previous comparable-period average; minimum source counts are required.
- **Teacher assessments created/completed:** owned assessments created/completed inside the selected period.
- **Teacher feedback time:** median submission-to-review-completion duration for assigned reviews.
- **Question contribution:** approved Question Bank items authored in period.
- **Risk rules:** low participation below configured threshold; low score below threshold with minimum attempts; repeated weak topic across at least two assessments; missing/late submissions from persisted assignments.

No ranking, pass/fail, improvement or decline is inferred without comparable real periods.

## 3. Database updates

- `academic_terms`: organization/year periods used for comparable reporting.
- `school_metric_snapshots`: school-period KPIs.
- `dimension_metric_snapshots`: grade, section, subject, chapter and topic rollups.
- `teacher_metric_snapshots`: supportive operational teacher measures.
- `student_risk_flags`: rule, evidence, severity, lifecycle and owner.
- `intervention_items`: actionable follow-up queue linked to evidence.
- `intervention_tasks`: assigned follow-up tasks with due/status.
- `trend_snapshots`: comparable current/previous values and direction.
- `report_runs`: immutable report request, source cutoff and artifact metadata.
- `intelligence_events`: durable notification outbox.

## 4. Route structure

```text
/dashboard/intelligence
/dashboard/intelligence/grades/[gradeId]
/dashboard/intelligence/sections/[sectionId]
/dashboard/intelligence/subjects/[subjectId]
/dashboard/intelligence/teachers
/dashboard/intelligence/teachers/[teacherId]
/dashboard/intelligence/risks
/dashboard/intelligence/interventions
/dashboard/intelligence/reports
/dashboard/intelligence/reports/[reportId]
```

## 5. Dashboard wireframe

Global filter bar → Academic Health cards → Attention Queue → two-column activity/upcoming area → teacher operations table → classes requiring attention → announcements and quick actions. Cards show `—` and evidence requirements until real snapshots exist. Trends always link to their dimension drill-down.

## 6. Drill-down hierarchy

School → Grade → Section → Subject → Chapter/Topic → Assessment → Submission/Question evidence. Teacher insights drill to owned assessments and pending reviews. Student risks drill to the exact assignments, attempts and topic evidence that triggered the rule.

## 7. Reporting architecture

Reports are asynchronous immutable runs. A request stores report type, filters, metric-definition version and source cutoff. CSV is the first adapter; PDF metadata/storage is prepared without advanced rendering. School, grade, section, subject, teacher and student summaries all use the same snapshot/query contracts as the UI.

## 8. Component hierarchy

```text
IntelligenceCenter
├─ GlobalIntelligenceFilters
├─ AcademicHealth
├─ DecisionQueue
├─ ActivityAndUpcoming
├─ TeacherOperations
├─ AttentionDimensions
└─ QuickActionsAndAnnouncements

DimensionDrilldown
├─ ContextHeader
├─ ComparablePeriodSummary
├─ EvidenceTable
├─ Trend/Distribution visualization slots
└─ RecommendedNextActions

InterventionCenter
├─ RuleFilters
├─ Evidence-backed queue
├─ Assignment dialog
└─ Task lifecycle
```

## 9. Development checklist

### Foundation milestone

- [x] Metric definitions and snapshot architecture
- [x] Additive analytics/risk/intervention/report schema
- [x] Executive command-center shell with global filters
- [x] Evidence-aware academic health and action queue
- [x] Grade, section and subject drill-down shells
- [x] Supportive teacher insights
- [x] Rule-based risk and intervention centers
- [x] Report catalog and PDF extension metadata
- [ ] Apply migration and regenerate Supabase types

### Data milestone

- [ ] Versioned aggregation jobs and source reconciliation
- [ ] Comparable-period resolver and minimum evidence rules
- [ ] Principal-scoped query repository
- [ ] Rule engine for risk creation/resolution
- [ ] Intervention/task persistence
- [ ] Intelligence notification producers

### Reporting milestone

- [ ] Snapshot-consistent school/grade/section/subject/teacher/student queries
- [ ] CSV adapter
- [ ] PDF renderer and private artifact storage
- [ ] Report job status and download authorization

### Hardening

- [ ] Cross-tenant and coordinator permission verification
- [ ] Metric fixture reconciliation
- [ ] Snapshot freshness monitoring
- [ ] Large-school drill-down and filter performance
