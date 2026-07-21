# Test Explorer Student Assessment Experience — Implementation Plan

## 1. Updated schema

The delivery schema extends the Phase 3 `assessments` domain and remains separate from legacy `exam_attempts`.

| Table | Purpose |
|---|---|
| `assessment_attempts` | One student attempt, timing, lifecycle, release policy snapshot, score fields |
| `assessment_attempt_state` | Current question, visited IDs, client revision, last heartbeat and connectivity metadata |
| `assessment_attempt_responses` | One durable response per attempt/question with answer JSON, save revision and timestamps |
| `assessment_attempt_bookmarks` | Reference-only student bookmarks |
| `assessment_submission_logs` | Append-only audit events for start, autosave, reconnect, submit, timeout and recovery |
| `assessment_delivery_events` | Outbox events for assigned, reminder, started, submitted and result released |

Answers use JSONB because response shapes vary by question type. Filterable lifecycle fields stay relational. Unique constraints make autosave upserts idempotent. Published question revision and assignment policies are snapshotted when an attempt starts.

## 2. Route structure

```text
/dashboard                           work-first student home
/dashboard/assessments               assigned assessments
/dashboard/assessments/[id]          details and expectations
/dashboard/assessments/[id]/check    instructions and device check
/assessments/[id]/attempt/[attemptId] reusable player
/assessments/[id]/attempt/[attemptId]/submitted
/assessments/[id]/attempt/[attemptId]/result
/assessments/[id]/attempt/[attemptId]/review
```

Teacher authoring remains under the existing dashboard routes. Role-aware routing selects student assignment views without redesigning Phase 3.

## 3. Student journey

Login → work-first dashboard → assigned assessment list → details → instructions → friendly pre-flight checks → start/resume → autosaved player → submission summary → confirmation → release-policy-aware result → optional review.

Every transition communicates whether work is local, saving, saved, offline, retrying, submitted, or awaiting result release.

## 4. Assessment player architecture

`AssessmentPlayer` is the single school-delivery engine. It receives a normalized `DeliveryAssessment`, `DeliveryQuestion[]`, initial attempt snapshot and an autosave adapter. Question rendering is delegated to one `QuestionRenderer` switch covering MCQ, MSQ, true/false, blank, numerical, short answer and essay. Navigation, palette, timer, bookmarks, submission and connectivity all share one state controller.

The legacy competitive-exam player remains available through an adapter during migration. New school assessments never create a second player.

## 5. Autosave strategy

- Apply answer/navigation/bookmark changes locally immediately.
- Debounce ordinary saves by 600 ms; flush on question navigation, visibility change and submission.
- Send monotonically increasing client revisions and an idempotency key.
- Server upserts response/state only when the incoming revision is newer.
- Display `Saving…`, `Saved`, exact last-saved time, `Offline — saved on this device`, and `Retrying`.
- Queue unsent mutations in IndexedDB in the persistence milestone; replay in revision order after reconnect.
- Submission first flushes pending writes, then executes one idempotent server transaction.

## 6. Connectivity strategy

Browser online/offline events provide immediate hints; heartbeat latency and save failures determine degraded/poor status. Offline never clears local answers. Reconnection triggers ordered retry with exponential backoff and jitter. A persistent compact banner explains status without alarming the student. Required fullscreen can block starting; browser, screen and network warnings are otherwise advisory.

## 7. Mobile UX plan

- Compact sticky header with timer and save state.
- Single-column question content and minimum 44px touch targets.
- Sticky bottom Previous / Save & Next navigation.
- Palette opens as an accessible slide-up sheet.
- No fixed desktop sidebars or horizontal scrolling.
- Long answers resize vertically and remain visible above the mobile keyboard.

## 8. Accessibility plan

- Native radio, checkbox, input and textarea controls with explicit labels.
- Keyboard shortcuts: previous/next, bookmark, palette, and save; never override typing fields.
- Focus moves to the question heading after navigation.
- `aria-live` announces save, connection and timer warnings.
- Palette states use labels and shapes in addition to color.
- Large-text and high-contrast toggles persist for the attempt.
- Dialog focus trapping, Escape behavior and visible focus rings.

## 9. Development checklist

### Foundation milestone

- [x] Additive attempt/autosave/bookmark/submission schema
- [x] Student route map and role-aware assigned-assessment shell
- [x] Work-first dashboard shell with honest empty states
- [x] Assessment detail and pre-flight experiences
- [x] One responsive player supporting all seven question types
- [x] Palette, timer warnings, bookmarking and submission summary
- [x] Autosave/connectivity state infrastructure with local adapter
- [x] Release-policy-aware submitted/result/review shells
- [ ] Apply migration and regenerate Supabase types

### Persistence milestone

- [ ] Assignment repository and recipient resolution
- [ ] Atomic start/resume service with attempt limits
- [ ] Revision-aware response/state autosave endpoint
- [ ] IndexedDB offline mutation queue
- [ ] Idempotent submit/timeout transaction and submission logs
- [ ] Delivery-event outbox producers

### Delivery milestone

- [ ] Load published Question Bank revisions into the normalized player
- [ ] Enforce availability, fullscreen and attempts server-side
- [ ] Share exact renderer with Phase 3 teacher preview
- [ ] Scheduled/approval/hidden result release service
- [ ] Review permissions and explanation visibility

### Hardening

- [ ] Recovery testing across refresh, offline and duplicate tabs
- [ ] Keyboard and screen-reader QA
- [ ] Phone/tablet/browser matrix
- [ ] Timer drift and server-clock synchronization
- [ ] Load and concurrency validation
