# Communication and Parent Engagement — Implementation Plan

## 1. Updated schema

The communication domain keeps existing `school_announcements` and Phase 1 `notifications` readable during migration, while new records provide audience targeting, delivery tracing, templates and preferences.

- `communications`: canonical announcement, reminder, academic/result/system update, assessment or event message.
- `communication_audiences`: grade, section, class, subject, student, parent, role or organization targets.
- `communication_recipients`: resolved immutable recipient list and read state.
- `communication_deliveries`: per-recipient/channel delivery attempt and provider metadata.
- `communication_templates`: reusable variable-based templates.
- `notification_preferences`: per-user channels, reminders, digest and future quiet hours.
- `communication_events`: transactional event inbox/outbox linking platform events to policies.
- `parent_student_links`: verified guardian relationships, multiple children supported.
- `calendar_entries`: unified assessment, deadline, school event, holiday and announcement projection.
- `communication_attachments`: private storage metadata placeholder.

## 2. Event architecture

Domain transaction → durable event (`assessment_assigned`, `due_soon`, `started`, `submitted`, `result_released`, `feedback_published`, `announcement_published`, `teacher_mention`, `academic_warning`, `system_maintenance`) → policy resolver → audience resolver → recipient snapshot → preference evaluation → channel delivery jobs → receipts.

Events are idempotent and traceable to their source entity. Communications never become person-to-person chat.

## 3. Notification workflow

`draft → scheduled → published → archived` for authored communications. Publishing resolves recipients once and creates in-app/email deliveries. Push and SMS remain provider placeholders. Each delivery is `pending → processing → delivered/failed/suppressed`; in-app recipients separately track unread/read and future acknowledgement.

## 4. Parent portal structure

Child switcher → work-focused child dashboard → upcoming/completed assessments → release-authorized results → teacher feedback → announcements/notices → report-card placeholder. Parent access is read-only and requires an active verified `parent_student_links` record.

## 5. Route structure

```text
/dashboard/communication
/dashboard/communication/announcements
/dashboard/communication/new
/dashboard/communication/templates
/dashboard/communication/history
/dashboard/communication/calendar
/dashboard/communication/preferences
/dashboard/parent
/dashboard/parent/children/[studentId]
/dashboard/parent/children/[studentId]/assessments
/dashboard/parent/children/[studentId]/results
```

## 6. Component hierarchy

```text
CommunicationCenter
├─ Type/priority/status filters
├─ Contextual timeline
├─ Draft/scheduled cards
└─ Quick links: compose, templates, history, calendar
Composer → AudienceBuilder → Schedule → Review
Calendar → Month/Week/Agenda views
ParentPortal → ChildSwitcher → ChildSummary → Updates
History → SearchFilters → Delivery/Read table
Preferences → Channel toggles → reminder/digest controls
```

## 7. Communication lifecycle

Drafts are editable. Scheduled messages may be cancelled. Published messages are immutable except expiry/archive; corrections create a linked replacement. Recipient and delivery history is retained. Expiry removes active visibility but not audit history.

## 8. Service architecture

`CommunicationService` owns compose/schedule/publish/archive. `EventRouter` maps platform events to template/policy keys. `AudienceResolver` creates tenant-safe recipients. `NotificationProvider` abstracts in-app, email, push and SMS. `DeliveryOrchestrator` handles idempotency, retries, suppression and receipts. Feature code never imports delivery-provider SDKs.

## 9. Development checklist

### Foundation milestone

- [x] Additive communication, audience, receipt, preference, parent-link and calendar schema
- [x] Event and replaceable provider contracts
- [x] Central communication timeline and composer shell
- [x] Templates, history, preferences and calendar surfaces
- [x] Read-only multi-child parent portal shell
- [x] Role-aware navigation and route protection
- [x] Contextual dashboard widget extension points
- [ ] Apply migration and regenerate Supabase types

### Persistence milestone

- [ ] Communication CRUD and schedule/publish transaction
- [ ] Audience resolution and immutable recipient snapshot
- [ ] Real notification center repository and mark-read action
- [ ] Preferences persistence
- [ ] Parent link invitation/verification lifecycle
- [ ] Calendar projection repository

### Delivery milestone

- [ ] Event router and policy configuration
- [ ] In-app provider
- [ ] Email provider adapter
- [ ] Push/SMS adapters
- [ ] Retry, suppression, digest and delivery receipts
- [ ] Event producers across assessment/evaluation/intelligence

### Hardening

- [ ] Cross-tenant and guardian-link authorization tests
- [ ] Scheduling/idempotency verification
- [ ] Template variable validation and escaping
- [ ] Accessibility and mobile timeline/calendar QA
