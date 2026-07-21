# Teacher Productivity Engine — Implementation Plan

## 1. Productivity map

| Repetitive task | Embedded assistance | Target measurement |
|---|---|---|
| Drafting/reworking questions | Generate, rewrite, simplify, change difficulty, translate, explanation, hints, distractors | Active minutes from editor open to approved draft |
| Building balanced papers | Draft from chapter/outcome/filter, duration/marks suggestions, coverage and duplicate checks | Minutes from new assessment to review-ready paper |
| Grading constructed responses | Rubric score and feedback suggestions, missing-criterion highlights | Median manual-review seconds per response |
| Interpreting results | Evidence-cited misconceptions, weak topics, revision/reteach/follow-up drafts | Minutes from grading complete to action plan saved |
| Student planning | Evidence-cited practice, revision, progression and checklist drafts | Teacher edits required and plan preparation time |
| Report writing | Editable parent/principal/reflection/assessment/school drafts | Minutes from report request to approved draft |
| Import cleanup | DOCX/PDF extraction preview, validation, duplicates, OCR placeholder | Accepted questions per teacher minute |
| Finding content | Natural-language retrieval over existing questions only | Search-to-selection time and successful query rate |
| Repetitive management | Bulk edit/tag, shortcuts, templates, duplication, copy term, recent filters, pins/favorites | Actions/clicks avoided |

## 2. Integration points

- Question editor: subtle “Draft assistance” panel; suggestions never overwrite fields.
- Question library: natural-language search mode, duplicate review, bulk metadata, recent filters, favorites/pins.
- Assessment wizard: “Build draft” and “Improve blueprint” inside Steps 2–3; never enables publish.
- Grading workspace: suggestion drawer beside rubric/feedback; explicit Apply and Approve.
- Results and Intelligence: cited insight drafts linked to exact assessment/question/topic evidence.
- Student performance: teacher-approved support plans only; no chatbot.
- Reports: draft-writing action inside each existing report type.
- Import wizard: extraction/validation stage for DOCX/PDF; OCR remains labelled unavailable.

## 3. Updated schema

- `productivity_requests`: provider-neutral operation, input hash, context, policy and lifecycle.
- `productivity_generations`: provider/model metadata, editable output, citations, token/cost/latency and regeneration lineage.
- `productivity_suggestions`: field-level proposal, status, teacher edit and approval.
- `productivity_approvals`: append-only apply/approve/reject history.
- `productivity_usage_daily`: organization/user/operation time-saved and cost rollups.
- `saved_productivity_views`: recent/pinned searches and filters.
- `user_content_favorites`: favorite Question Bank items/collections/templates.

Prompt content is versioned and referenced by key/version; sensitive raw prompts need not be retained. Published domain records remain authoritative.

## 4. Component updates

```text
QuestionEditor → ProductivityAssistPanel → SuggestionReview
QuestionLibrary → SmartSearchMode + BulkBar + SavedViews
AssessmentWizard → PaperDraftAssistant + CoverageReview
GradingWorkspace → GradingSuggestions + RubricGapReview
ResultsWorkspace → EvidenceInsightDrafts
StudentPerformance → SupportPlanDraft
ReportCatalog → ReportDraftAction
ImportWizard → ExtractionPreview + DuplicateValidation
```

## 5. AI workflow architecture

Domain action → policy/context builder → redaction → `GenerationProvider` abstraction → structured schema validation → citation validation → suggestion record → editable review → explicit apply → explicit domain save/publish.

Retrieval and deterministic rules run before generation. Smart search never invokes generation. Provider calls run server-side through queued jobs with idempotency and cancellation.

## 6. Approval workflow

`requested → processing → ready → edited/applied → approved` or `rejected/expired`.

Generated content is stored separately from canonical questions, assessments, grades, plans and reports. Applying copies selected fields into an editable draft. Publishing/releasing remains the existing explicit workflow. Every approval records actor, timestamps, source generation and edited value hash.

## 7. Cost optimization strategy

- Retrieval/rules before generation; never generate when existing content answers the task.
- Hash normalized request + context + prompt version for safe reuse.
- Use smallest capable provider model per operation.
- Batch duplicate detection, extraction and classification.
- Cap context by relevance and cite IDs instead of repeating records.
- Organization budgets, per-operation limits, daily rollups and graceful disablement.
- Record estimated teacher minutes saved alongside latency and cost to measure ROI.

## 8. Model abstraction layer

`GenerationProvider` exposes `generateStructured`, `streamText`, capability metadata and usage. The orchestration service depends only on this interface. Provider adapters translate schema/tool formats and errors. A registry selects by operation policy, availability, geography and cost. No provider SDK enters feature components or domain services.

## 9. Development checklist

### Foundation milestone

- [x] Productivity map and measurable events
- [x] Additive request/generation/suggestion/approval/usage schema
- [x] Provider-neutral TypeScript contracts and registry
- [x] Embedded question assistance review panel
- [x] Assessment draft/coverage assistance extension
- [x] Grading suggestion extension
- [x] Import extraction and duplicate-validation extension
- [x] Smart-search contract and productivity preferences
- [ ] Apply migration and regenerate Supabase types

### Orchestration milestone

- [ ] Server-side policy/context/redaction builders
- [ ] First provider adapter and structured validation
- [ ] Citation verifier and duplicate retrieval
- [ ] Queued jobs, retries, cancellation and budgets
- [ ] Suggestion apply/approve/reject actions

### Workflow milestone

- [ ] Question operations and batch assistance
- [ ] Assessment draft, balance, variants and recommendations
- [ ] Rubric/feedback grading suggestions
- [ ] Evidence-cited result/support insights
- [ ] Report draft generation
- [ ] DOCX/PDF extraction pipeline and OCR adapter placeholder

### Measurement and hardening

- [ ] Time-to-completion baselines and saved-time events
- [ ] Provider cost/quality dashboards
- [ ] Prompt-injection and data-leakage controls
- [ ] Teacher approval audit verification
- [ ] Organization retention and opt-out controls
