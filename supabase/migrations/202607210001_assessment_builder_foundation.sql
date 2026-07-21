-- School Assessment Builder foundation. Legacy exams and attempts are preserved.
create extension if not exists pgcrypto;

create table if not exists public.assessment_types (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  system_key text, name text not null, description text, color text, is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, name)
);
create unique index if not exists assessment_types_system_key_unique on public.assessment_types (organization_id, system_key) where system_key is not null;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete restrict, grade_id uuid not null references public.grades(id) on delete restrict,
  subject_id uuid not null references public.organization_subjects(id) on delete restrict, assessment_type_id uuid references public.assessment_types(id) on delete set null,
  owner_id uuid not null references public.profiles(id) on delete restrict, title text not null, description text,
  status text not null default 'draft' check (status in ('draft','scheduled','published','active','completed','archived')),
  total_marks numeric(10,2) not null default 0 check (total_marks >= 0), duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  passing_marks numeric(10,2) check (passing_marks is null or passing_marks >= 0), passing_percentage numeric(5,2) check (passing_percentage is null or passing_percentage between 0 and 100),
  negative_marking_enabled boolean not null default false, instructions jsonb not null default '[]'::jsonb,
  blueprint jsonb not null default '{}'::jsonb, settings jsonb not null default '{}'::jsonb, current_revision integer not null default 1,
  published_at timestamptz, completed_at timestamptz, archived_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.assessment_sections (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade, title text not null default 'Questions', instructions text,
  sort_order integer not null default 0, marks_limit numeric(10,2), question_limit integer, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessment_id, sort_order)
);

create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade, assessment_section_id uuid references public.assessment_sections(id) on delete cascade,
  question_id uuid not null references public.question_bank_items(id) on delete restrict, question_revision integer not null default 1,
  marks numeric(10,2) not null check (marks >= 0), negative_marks numeric(10,2) not null default 0 check (negative_marks >= 0), sort_order integer not null,
  created_at timestamptz not null default now(), unique (assessment_id, question_id), unique (assessment_id, sort_order)
);

create table if not exists public.assessment_assignments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade, status text not null default 'draft' check (status in ('draft','scheduled','active','closed','cancelled')),
  available_from timestamptz, due_at timestamptz, attempts_allowed integer not null default 1 check (attempts_allowed > 0),
  shuffle_questions boolean not null default false, shuffle_options boolean not null default false, show_result_immediately boolean not null default false,
  answer_release_at timestamptz, calculator_allowed boolean not null default false, fullscreen_mode boolean not null default false,
  late_submission_policy text not null default 'not_allowed' check (late_submission_policy in ('not_allowed','allowed','allowed_with_penalty')),
  settings jsonb not null default '{}'::jsonb, created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), constraint assessment_assignment_window check (due_at is null or available_from is null or due_at > available_from)
);

create table if not exists public.assessment_assignment_sections (
  organization_id uuid not null references public.organizations(id) on delete cascade, assignment_id uuid not null references public.assessment_assignments(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete restrict, created_at timestamptz not null default now(), primary key (assignment_id, section_id)
);
create table if not exists public.assessment_assignment_students (
  organization_id uuid not null references public.organizations(id) on delete cascade, assignment_id uuid not null references public.assessment_assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete restrict, inclusion text not null default 'include' check (inclusion in ('include','exclude')),
  created_at timestamptz not null default now(), primary key (assignment_id, student_id)
);

create table if not exists public.assessment_templates (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, description text, assessment_type_id uuid references public.assessment_types(id) on delete set null,
  grade_id uuid references public.grades(id) on delete set null, subject_id uuid references public.organization_subjects(id) on delete set null,
  blueprint jsonb not null default '{}'::jsonb, settings jsonb not null default '{}'::jsonb, owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz, unique (organization_id, name)
);

create table if not exists public.assessment_status_history (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade, from_status text, to_status text not null,
  changed_by uuid references public.profiles(id) on delete set null, reason text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create table if not exists public.assessment_notification_events (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade, assignment_id uuid references public.assessment_assignments(id) on delete cascade,
  event_type text not null check (event_type in ('student_assigned','teacher_published','reminder')), payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','processing','delivered','failed','cancelled')), available_at timestamptz not null default now(),
  processed_at timestamptz, attempts integer not null default 0, created_at timestamptz not null default now()
);

create index if not exists assessments_org_status_updated_idx on public.assessments (organization_id, status, updated_at desc, id);
create index if not exists assessments_org_owner_idx on public.assessments (organization_id, owner_id, updated_at desc);
create index if not exists assessments_org_academic_idx on public.assessments (organization_id, academic_year_id, grade_id, subject_id);
create index if not exists assessment_questions_paper_idx on public.assessment_questions (assessment_id, sort_order);
create index if not exists assessment_assignments_window_idx on public.assessment_assignments (organization_id, status, available_from, due_at);
create index if not exists assessment_assignment_sections_section_idx on public.assessment_assignment_sections (section_id, assignment_id);
create index if not exists assessment_assignment_students_student_idx on public.assessment_assignment_students (student_id, assignment_id);
create index if not exists assessment_history_assessment_idx on public.assessment_status_history (assessment_id, created_at desc);
create index if not exists assessment_notification_outbox_idx on public.assessment_notification_events (status, available_at) where status in ('pending','failed');

do $$ declare relation_name text; begin
  foreach relation_name in array array['assessment_types','assessments','assessment_sections','assessment_questions','assessment_assignments','assessment_assignment_sections','assessment_assignment_students','assessment_templates','assessment_status_history','assessment_notification_events'] loop
    execute format('alter table public.%I enable row level security', relation_name);
    execute format('drop policy if exists assessment_author_read on public.%I', relation_name);
    execute format('create policy assessment_author_read on public.%I for select to authenticated using ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id()))', relation_name);
    execute format('drop policy if exists assessment_author_manage on public.%I', relation_name);
    execute format('create policy assessment_author_manage on public.%I for all to authenticated using ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id())) with check ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id()))', relation_name);
  end loop;
end $$;

comment on table public.assessment_questions is 'Ordered references to canonical Question Bank items with publication-safe marks and revision snapshots.';
comment on table public.assessment_notification_events is 'Transactional outbox infrastructure only; notification delivery is intentionally deferred.';
