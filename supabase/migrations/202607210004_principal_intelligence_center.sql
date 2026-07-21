-- Reproducible principal intelligence snapshots and action workflows.
create table if not exists public.academic_terms (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  name text not null, starts_on date not null, ends_on date not null, sort_order integer not null default 0, created_at timestamptz not null default now(), unique (academic_year_id, name), check (ends_on > starts_on)
);
create table if not exists public.school_metric_snapshots (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade, academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.academic_terms(id) on delete set null, period_start date not null, period_end date not null, school_average numeric(5,2), completion_rate numeric(5,2), participation_rate numeric(5,2),
  median_grading_seconds numeric(14,2), eligible_students integer not null default 0, source_assessments integer not null default 0, source_attempts integer not null default 0,
  definition_version integer not null, calculated_at timestamptz not null default now(), unique (organization_id, period_start, period_end, definition_version)
);
create table if not exists public.dimension_metric_snapshots (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade, academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  term_id uuid references public.academic_terms(id) on delete set null, dimension_type text not null check (dimension_type in ('grade','section','subject','chapter','topic')),
  dimension_id uuid not null, period_start date not null, period_end date not null, average_score numeric(5,2), participation_rate numeric(5,2), completion_rate numeric(5,2),
  assessment_count integer not null default 0, source_attempts integer not null default 0, metadata jsonb not null default '{}'::jsonb, definition_version integer not null, calculated_at timestamptz not null default now(),
  unique (organization_id, dimension_type, dimension_id, period_start, period_end, definition_version)
);
create table if not exists public.teacher_metric_snapshots (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade, teacher_id uuid not null references public.profiles(id) on delete cascade,
  period_start date not null, period_end date not null, assessments_created integer not null default 0, assessments_completed integer not null default 0, pending_reviews integer not null default 0,
  average_student_score numeric(5,2), median_feedback_seconds numeric(14,2), question_contributions integer not null default 0, activity_count integer not null default 0,
  source_attempts integer not null default 0, definition_version integer not null, calculated_at timestamptz not null default now(), unique (teacher_id, period_start, period_end, definition_version)
);
create table if not exists public.trend_snapshots (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade, dimension_type text not null,
  dimension_id uuid, metric_key text not null, current_value numeric, previous_value numeric, delta numeric, direction text not null check (direction in ('improving','declining','stable','insufficient_data')),
  current_period daterange not null, previous_period daterange, source_count integer not null default 0, definition_version integer not null, calculated_at timestamptz not null default now()
);
create table if not exists public.student_risk_flags (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, student_id uuid not null references public.profiles(id) on delete cascade,
  rule_key text not null check (rule_key in ('low_participation','low_score','repeated_weak_topic','missing_assessment','late_submission')), severity text not null check (severity in ('low','medium','high')),
  status text not null default 'open' check (status in ('open','acknowledged','resolved','dismissed')), evidence jsonb not null, first_detected_at timestamptz not null default now(), last_detected_at timestamptz not null default now(), resolved_at timestamptz,
  unique (organization_id, student_id, rule_key, status)
);
create table if not exists public.intervention_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, title text not null, description text,
  entity_type text not null, entity_id text not null, reason_code text not null, evidence jsonb not null, priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'open' check (status in ('open','in_progress','resolved','dismissed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), resolved_at timestamptz
);
create table if not exists public.intervention_tasks (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, intervention_id uuid not null references public.intervention_items(id) on delete cascade,
  title text not null, assigned_to uuid references public.profiles(id) on delete set null, assigned_by uuid references public.profiles(id) on delete set null, due_at timestamptz,
  status text not null default 'open' check (status in ('open','in_progress','completed','cancelled')), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.report_runs (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, requested_by uuid not null references public.profiles(id) on delete restrict,
  report_type text not null check (report_type in ('school','grade','section','subject','teacher','student')), filters jsonb not null default '{}'::jsonb, definition_version integer not null,
  source_cutoff timestamptz not null, status text not null default 'queued' check (status in ('queued','processing','completed','failed','expired')), format text not null check (format in ('csv','pdf','xlsx')),
  storage_path text, file_size_bytes bigint, error_message text, created_at timestamptz not null default now(), completed_at timestamptz, expires_at timestamptz
);
create table if not exists public.intelligence_events (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade, event_type text not null check (event_type in ('assessment_completed','teacher_review_delayed','participation_low','academic_trend_changed')),
  entity_type text not null, entity_id text, payload jsonb not null default '{}'::jsonb, status text not null default 'pending' check (status in ('pending','processing','delivered','failed','cancelled')), available_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create index if not exists school_snapshots_period_idx on public.school_metric_snapshots (organization_id, period_end desc, definition_version);
create index if not exists dimension_snapshots_lookup_idx on public.dimension_metric_snapshots (organization_id, dimension_type, dimension_id, period_end desc);
create index if not exists teacher_snapshots_lookup_idx on public.teacher_metric_snapshots (organization_id, teacher_id, period_end desc);
create index if not exists risk_flags_queue_idx on public.student_risk_flags (organization_id, status, severity, last_detected_at desc);
create index if not exists interventions_queue_idx on public.intervention_items (organization_id, status, priority, updated_at desc);
create index if not exists report_runs_requester_idx on public.report_runs (organization_id, requested_by, created_at desc);
do $$ declare relation_name text; begin foreach relation_name in array array['academic_terms','school_metric_snapshots','dimension_metric_snapshots','teacher_metric_snapshots','trend_snapshots','student_risk_flags','intervention_items','intervention_tasks','report_runs','intelligence_events'] loop execute format('alter table public.%I enable row level security',relation_name);execute format('drop policy if exists intelligence_admin_access on public.%I',relation_name);execute format('create policy intelligence_admin_access on public.%I for all to authenticated using ((public.current_profile_role() in (''super_admin'',''school_admin'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id())) with check ((public.current_profile_role() in (''super_admin'',''school_admin'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id()))',relation_name);end loop;end $$;
comment on table public.school_metric_snapshots is 'Reproducible school-period metrics with explicit population, source counts and definition version.';
comment on table public.student_risk_flags is 'Deterministic rule flags only; no predictive or AI inference.';
