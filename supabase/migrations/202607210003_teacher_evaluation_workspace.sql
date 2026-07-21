-- Teacher evaluation, grading, feedback and derived analytics.
create table if not exists public.rubrics (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, description text, owner_id uuid references public.profiles(id) on delete set null,
  visibility text not null default 'organization' check (visibility in ('private','organization')), status text not null default 'active' check (status in ('draft','active','archived')),
  total_marks numeric(10,2) not null default 0 check (total_marks >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, name)
);
create table if not exists public.rubric_criteria (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  rubric_id uuid not null references public.rubrics(id) on delete cascade, name text not null, description text,
  maximum_marks numeric(10,2) not null check (maximum_marks > 0), sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (rubric_id, sort_order)
);
create table if not exists public.assessment_question_rubrics (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_question_id uuid primary key references public.assessment_questions(id) on delete cascade, rubric_id uuid not null references public.rubrics(id) on delete restrict,
  rubric_revision integer not null default 1, assigned_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.manual_grades (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  response_id uuid not null references public.assessment_attempt_responses(id) on delete cascade, attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  grader_id uuid not null references public.profiles(id) on delete restrict, rubric_id uuid references public.rubrics(id) on delete set null,
  awarded_marks numeric(10,2) not null check (awarded_marks >= 0), criterion_scores jsonb not null default '[]'::jsonb,
  feedback text, private_note text, review_status text not null default 'in_progress' check (review_status in ('in_progress','reviewed','reopened')),
  revision bigint not null default 1, reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (response_id)
);
create table if not exists public.attempt_feedback (
  attempt_id uuid primary key references public.assessment_attempts(id) on delete cascade, organization_id uuid not null references public.organizations(id) on delete cascade,
  overall_feedback text, positive_notes text, improvement_suggestions text, private_teacher_notes text,
  author_id uuid not null references public.profiles(id) on delete restrict, revision bigint not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.feedback_templates (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null, name text not null, category text, content text not null,
  visibility text not null default 'private' check (visibility in ('private','organization')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, owner_id, name)
);
create table if not exists public.assessment_review_state (
  attempt_id uuid primary key references public.assessment_attempts(id) on delete cascade, organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','in_review','completed','reopened','not_required')), assigned_reviewer_id uuid references public.profiles(id) on delete set null,
  reviewed_responses integer not null default 0, required_responses integer not null default 0, has_teacher_comment boolean not null default false,
  started_at timestamptz, completed_at timestamptz, updated_at timestamptz not null default now()
);
create table if not exists public.assessment_question_metrics (
  organization_id uuid not null references public.organizations(id) on delete cascade, assessment_id uuid not null references public.assessments(id) on delete cascade,
  question_id uuid not null references public.question_bank_items(id) on delete restrict, attempt_count integer not null default 0, correct_count integer not null default 0,
  incorrect_count integer not null default 0, skipped_count integer not null default 0, average_time_seconds numeric(12,2), average_awarded_marks numeric(10,2),
  common_wrong_options jsonb not null default '[]'::jsonb, calculation_version integer not null default 1, calculated_at timestamptz not null default now(), primary key (assessment_id, question_id)
);
create table if not exists public.assessment_metrics (
  assessment_id uuid primary key references public.assessments(id) on delete cascade, organization_id uuid not null references public.organizations(id) on delete cascade,
  eligible_students integer not null default 0, submitted_attempts integer not null default 0, graded_attempts integer not null default 0,
  average_score numeric(10,2), median_score numeric(10,2), highest_score numeric(10,2), lowest_score numeric(10,2),
  released_results integer not null default 0, source_attempt_count integer not null default 0, calculation_version integer not null default 1, calculated_at timestamptz not null default now()
);
create table if not exists public.evaluation_events (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid references public.assessments(id) on delete cascade, attempt_id uuid references public.assessment_attempts(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null, recipient_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('teacher_feedback_added','results_released','review_completed','results_hidden','results_republished')),
  payload jsonb not null default '{}'::jsonb, delivery_status text not null default 'pending' check (delivery_status in ('pending','processing','delivered','failed','cancelled')),
  available_at timestamptz not null default now(), processed_at timestamptz, created_at timestamptz not null default now()
);

create index if not exists manual_grades_attempt_idx on public.manual_grades (attempt_id, review_status, updated_at);
create index if not exists review_state_queue_idx on public.assessment_review_state (organization_id, assigned_reviewer_id, status, updated_at);
create index if not exists question_metrics_weak_idx on public.assessment_question_metrics (assessment_id, average_awarded_marks, attempt_count);
create index if not exists feedback_templates_owner_idx on public.feedback_templates (organization_id, owner_id, category);
create index if not exists evaluation_event_outbox_idx on public.evaluation_events (delivery_status, available_at) where delivery_status in ('pending','failed');

do $$ declare relation_name text; begin
  foreach relation_name in array array['rubrics','rubric_criteria','assessment_question_rubrics','manual_grades','attempt_feedback','feedback_templates','assessment_review_state','assessment_question_metrics','assessment_metrics','evaluation_events'] loop
    execute format('alter table public.%I enable row level security', relation_name);
    execute format('drop policy if exists evaluation_teacher_access on public.%I', relation_name);
    execute format('create policy evaluation_teacher_access on public.%I for all to authenticated using ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id())) with check ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id()))', relation_name);
  end loop;
end $$;

drop policy if exists student_read_released_attempt_feedback on public.attempt_feedback;
create policy student_read_released_attempt_feedback on public.attempt_feedback
  for select to authenticated
  using (exists (
    select 1 from public.assessment_attempts attempt
    where attempt.id = attempt_feedback.attempt_id
      and attempt.student_id = auth.uid()
      and attempt.result_released_at is not null
  ));

drop policy if exists student_read_released_manual_grades on public.manual_grades;
create policy student_read_released_manual_grades on public.manual_grades
  for select to authenticated
  using (exists (
    select 1 from public.assessment_attempts attempt
    where attempt.id = manual_grades.attempt_id
      and attempt.student_id = auth.uid()
      and attempt.result_released_at is not null
  ));

comment on table public.assessment_metrics is 'Versioned derived cache calculated only from real eligible students and persisted attempts.';
comment on table public.manual_grades is 'Single authoritative manual grade per response; future AI may propose but cannot finalize grades.';
