-- Student assessment delivery. Legacy exam_attempts remain unchanged.
create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete restrict, assignment_id uuid not null references public.assessment_assignments(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict, attempt_number integer not null check (attempt_number > 0),
  status text not null default 'not_started' check (status in ('not_started','in_progress','submitted','timed_out','graded','invalidated')),
  assessment_revision integer not null, started_at timestamptz, submitted_at timestamptz, expires_at timestamptz,
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0), submission_reason text,
  result_release_policy text not null default 'hidden' check (result_release_policy in ('immediate','scheduled','teacher_approval','hidden')),
  result_release_at timestamptz, result_released_at timestamptz, score numeric(10,2), max_score numeric(10,2), percentage numeric(5,2), grade text,
  teacher_feedback text, grading_metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assignment_id, student_id, attempt_number)
);

create table if not exists public.assessment_attempt_state (
  attempt_id uuid primary key references public.assessment_attempts(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade, current_question_id uuid references public.question_bank_items(id) on delete set null,
  visited_question_ids uuid[] not null default '{}', client_revision bigint not null default 0, last_heartbeat_at timestamptz,
  last_connectivity text check (last_connectivity is null or last_connectivity in ('online','poor','offline')), device_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.assessment_attempt_responses (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade, question_id uuid not null references public.question_bank_items(id) on delete restrict,
  answer jsonb not null default '{}'::jsonb, client_revision bigint not null default 0, answered_at timestamptz, first_saved_at timestamptz not null default now(),
  last_saved_at timestamptz not null default now(), grading_status text not null default 'ungraded' check (grading_status in ('ungraded','auto_graded','needs_review','graded')),
  awarded_marks numeric(10,2), grader_feedback text, unique (attempt_id, question_id)
);

create table if not exists public.assessment_attempt_bookmarks (
  organization_id uuid not null references public.organizations(id) on delete cascade, attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  question_id uuid not null references public.question_bank_items(id) on delete cascade, created_at timestamptz not null default now(), primary key (attempt_id, question_id)
);

create table if not exists public.assessment_submission_logs (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade,
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  event_type text not null check (event_type in ('started','autosaved','offline','reconnected','submit_requested','submitted','timed_out','recovered','invalidated')),
  idempotency_key text, client_revision bigint, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create unique index if not exists assessment_submission_log_idempotency on public.assessment_submission_logs (attempt_id, idempotency_key) where idempotency_key is not null;

create table if not exists public.assessment_delivery_events (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade, attempt_id uuid references public.assessment_attempts(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null check (event_type in ('assessment_assigned','reminder','started','submitted','result_released')),
  payload jsonb not null default '{}'::jsonb, status text not null default 'pending' check (status in ('pending','processing','delivered','failed','cancelled')),
  available_at timestamptz not null default now(), processed_at timestamptz, attempts integer not null default 0, created_at timestamptz not null default now()
);

create index if not exists assessment_attempts_student_status_idx on public.assessment_attempts (organization_id, student_id, status, updated_at desc);
create index if not exists assessment_attempts_assignment_idx on public.assessment_attempts (assignment_id, student_id);
create index if not exists assessment_responses_attempt_idx on public.assessment_attempt_responses (attempt_id, last_saved_at);
create index if not exists assessment_submission_logs_attempt_idx on public.assessment_submission_logs (attempt_id, created_at desc);
create index if not exists assessment_delivery_outbox_idx on public.assessment_delivery_events (status, available_at) where status in ('pending','failed');

alter table public.assessment_attempts enable row level security;
alter table public.assessment_attempt_state enable row level security;
alter table public.assessment_attempt_responses enable row level security;
alter table public.assessment_attempt_bookmarks enable row level security;
alter table public.assessment_submission_logs enable row level security;
alter table public.assessment_delivery_events enable row level security;

do $$ declare relation_name text; begin
  foreach relation_name in array array['assessment_attempt_state','assessment_attempt_responses','assessment_attempt_bookmarks','assessment_submission_logs'] loop
    execute format('drop policy if exists attempt_participant_access on public.%I', relation_name);
    execute format('create policy attempt_participant_access on public.%I for select to authenticated using (public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'') and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id()) or exists (select 1 from public.assessment_attempts a where a.id = %I.attempt_id and a.student_id = auth.uid()))', relation_name, relation_name);
  end loop;
end $$;

drop policy if exists student_read_own_attempt on public.assessment_attempts;
create policy student_read_own_attempt on public.assessment_attempts for select to authenticated using (student_id = auth.uid() or (public.current_profile_role() in ('super_admin','school_admin','teacher') and (public.current_profile_role() = 'super_admin' or organization_id = public.current_organization_id())));

-- Writes are intentionally routed through security-definer delivery functions in the persistence milestone.
comment on table public.assessment_attempt_responses is 'Revision-aware durable answers for every supported Question Bank response shape.';
comment on table public.assessment_delivery_events is 'Notification outbox infrastructure; delivery is intentionally not implemented.';
