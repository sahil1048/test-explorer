# Test Explorer Question Bank — Implementation Plan

## 1. Database design

The school Question Bank is additive. Legacy `questions` and `question_banks` remain untouched because current course, mock-test, and upload routes depend on their existing shape.

Core tables:

- `question_chapters`: organization, grade, subject, academic year, name, order.
- `question_topics`: chapter-owned topics.
- `question_bank_items`: stable question identity, tenant scope, academic classification, type, content, scoring, workflow status, locale, author, lifecycle timestamps, and search vector.
- `question_options`: ordered answers for choice-based questions; supports one or many correct options.
- `question_answers`: extensible answer specifications for boolean, blanks, numerical tolerances, and text rubrics.
- `question_taxonomy_terms` and `question_taxonomy_links`: organization-defined learning outcomes, skills, and tags without growing the question row.
- `question_attachments`: storage metadata only; files remain in Supabase Storage.
- `question_collections` and `question_collection_items`: folders reference questions without copying them.
- `question_revisions`: immutable snapshots reserved for version history and moderation.

Scale decisions:

- UUID identities avoid cross-tenant collisions.
- Every high-volume access path begins with `organization_id`.
- Keyset pagination uses `(updated_at, id)`; offset pagination is not the long-term API contract.
- Generated weighted `tsvector` supports PostgreSQL full-text search; trigram title search can be added when fuzzy matching is proven necessary.
- JSONB is limited to rich-text documents and answer configuration. Filterable metadata remains relational/indexed.
- Archive is soft deletion; permanent deletion is separately permissioned.
- Usage and success analytics remain outside the canonical question row until assessment attempts exist.

## 2. Folder structure

```text
app/dashboard/question-bank/
  page.tsx
  new/page.tsx
  [questionId]/page.tsx
  import/page.tsx
  collections/page.tsx
features/question-bank/
  types.ts
  data/question-repository.ts
  components/question-bank-header.tsx
features/question-library/components/
  question-library.tsx
  question-preview-drawer.tsx
  question-filters.tsx
features/question-editor/components/
  question-editor.tsx
features/question-import/components/
  import-wizard.tsx
features/question-collections/components/
  collections-view.tsx
```

Server repositories own tenant-scoped reads. Client components own transient UI state. Future server actions will sit beside their feature rather than inside route files.

## 3. Component tree

```text
QuestionBankPage
└─ QuestionLibrary
   ├─ QuestionBankHeader
   ├─ SearchAndViewControls
   ├─ QuestionFilters
   ├─ BulkActionBar
   ├─ QuestionTable / QuestionGrid
   ├─ PaginationControls
   └─ QuestionPreviewDrawer

QuestionEditorPage
└─ QuestionEditor
   ├─ AutosaveHeader
   ├─ QuestionContentSection
   ├─ OptionsAndAnswerSection
   ├─ ExplanationAndHintsSection
   ├─ AttachmentsSection
   ├─ MetadataPanel
   └─ PreviewPanel

QuestionImportPage
└─ ImportWizard
   ├─ SourceChooser
   ├─ AcademicContext
   ├─ UploadArea
   ├─ MappingAndValidation
   ├─ PreviewTable
   └─ ImportResult
```

## 4. Route map

| Route | Purpose |
|---|---|
| `/dashboard/question-bank` | Searchable library, filters, bulk actions, preview |
| `/dashboard/question-bank/new` | Create a question |
| `/dashboard/question-bank/[questionId]` | Edit/review an existing question |
| `/dashboard/question-bank/import` | CSV, DOCX, and PDF-placeholder import wizard |
| `/dashboard/question-bank/collections` | Reference-only folders |

The future Assessment Builder consumes approved question IDs through a repository contract; no assessment UI is added now.

## 5. UI flow

Library → search/filter → preview → edit/duplicate/archive. Create Question opens a distraction-reduced editor with content on the left, metadata on the right, and a preview mode. Draft is the default. Submit for review and approve are distinct permission-aware transitions. Bulk actions only appear after selection.

## 6. Import flow

1. Select CSV or DOCX; PDF is visible but disabled and honestly labelled.
2. Select academic year, grade, subject, and optional chapter/topic defaults.
3. Upload and parse into a temporary batch.
4. Map columns/sections to the canonical model.
5. Validate required fields, types, answers, marks, and taxonomy references.
6. Preview valid and invalid rows; download errors.
7. Import valid rows as drafts in a transaction and show the result.

Uploads never publish or approve questions automatically.

## 7. Search strategy

- PostgreSQL full-text search over title, plain-text body, explanation, and tags.
- Composite B-tree indexes for tenant + status/type/difficulty/subject/grade/author/update time.
- Exact filters are applied before full-text ranking.
- Results use keyset pagination and deterministic sorting.
- The UI serializes filters into URL parameters so searches are shareable and survive navigation.
- Millions-scale external search is deferred until query telemetry proves PostgreSQL insufficient.

## 8. Migration plan

1. Apply the additive Question Bank migration after Phase 1.
2. Verify RLS using school-admin, teacher, student, and cross-organization sessions.
3. Create a private `question-attachments` storage bucket and signed-upload policy.
4. Ship the empty library and editor against the new tables.
5. Add an explicit legacy importer that copies selected legacy questions into drafts; never mutate the source rows.
6. Backfill searchable plain text and taxonomy in batches.
7. Reconcile counts, sample answers, then enable the Assessment Builder integration contract.

Rollback disables the new routes and drops only the new `qb_*`/`question_*` foundation tables. Legacy assessment data is unaffected.

## 9. Development checklist

### Foundation

- [x] Database and index design
- [x] Route and component boundaries
- [x] Library shell with responsive table/grid and honest empty state
- [x] Editor supporting all seven types at the UI/domain layer
- [x] Import wizard shell with CSV/DOCX and PDF placeholder
- [x] Collections reference model and shell
- [x] Dashboard navigation entry
- [ ] Apply migration and generate database types

### Persistence

- [ ] Tenant-scoped repository and cursor pagination
- [ ] Create/update/autosave server actions with optimistic concurrency
- [ ] Review/approval/archive/duplicate actions
- [ ] Attachment signed uploads
- [ ] Collection CRUD and membership actions

### Import and search

- [ ] CSV parser and downloadable template
- [ ] DOCX parser
- [ ] Validation result persistence and preview
- [ ] URL-backed filters and database full-text search
- [ ] Export selected questions

### Hardening

- [ ] Route/action permission enforcement
- [ ] Cross-tenant RLS verification
- [ ] Autosave recovery and conflict UX
- [ ] Accessibility and mobile interaction QA
- [ ] Performance validation at 1M questions
