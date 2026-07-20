-- Test Explorer Phase 1: school platform foundation
-- Additive migration. Existing competitive-exam and assessment tables are preserved.

create extension if not exists pgcrypto;
create extension if not exists citext;

alter table if exists public.organizations
  add column if not exists school_code citext,
  add column if not exists custom_domain citext,
  add column if not exists address_line_1 text,
  add column if not exists address_line_2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text,
  add column if not exists country_code text not null default 'IN',
  add column if not exists timezone text not null default 'Asia/Kolkata',
  add column if not exists locale text not null default 'en-IN',
  add column if not exists branding jsonb not null default '{}'::jsonb,
  add column if not exists settings jsonb not null default '{}'::jsonb,
  add column if not exists onboarding_status text not null default 'not_started',
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists archived_at timestamptz;

alter table if exists public.profiles
  add column if not exists avatar_url text,
  add column if not exists status text not null default 'active',
  add column if not exists last_active_at timestamptz,
  add column if not exists invited_at timestamptz,
  add column if not exists joined_at timestamptz default now(),
  add column if not exists archived_at timestamptz;

create unique index if not exists organizations_school_code_unique
  on public.organizations (lower(school_code::text))
  where school_code is not null;

create unique index if not exists organizations_custom_domain_unique
  on public.organizations (lower(custom_domain::text))
  where custom_domain is not null;

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'future' check (status in ('future', 'current', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint academic_year_dates_valid check (ends_on > starts_on),
  constraint academic_year_name_unique unique (organization_id, name)
);

create unique index if not exists academic_year_one_current_per_org
  on public.academic_years (organization_id)
  where status = 'current' and archived_at is null;

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grade_name_unique unique (organization_id, name)
);

create unique index if not exists grades_code_unique
  on public.grades (organization_id, lower(code))
  where code is not null;

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  grade_id uuid not null references public.grades(id) on delete restrict,
  name text not null,
  capacity integer check (capacity is null or capacity > 0),
  homeroom_teacher_id uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint section_name_unique unique (academic_year_id, grade_id, name)
);

create table if not exists public.organization_subjects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text,
  color text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_subject_name_unique unique (organization_id, name)
);

create unique index if not exists organization_subject_code_unique
  on public.organization_subjects (organization_id, lower(code))
  where code is not null;

create table if not exists public.section_subjects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  section_id uuid not null references public.sections(id) on delete cascade,
  subject_id uuid not null references public.organization_subjects(id) on delete cascade,
  weekly_periods integer check (weekly_periods is null or weekly_periods >= 0),
  created_at timestamptz not null default now(),
  constraint section_subject_unique unique (section_id, subject_id)
);

create table if not exists public.profile_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  academic_year_id uuid references public.academic_years(id) on delete cascade,
  grade_id uuid references public.grades(id) on delete cascade,
  section_id uuid references public.sections(id) on delete cascade,
  subject_id uuid references public.organization_subjects(id) on delete cascade,
  assignment_role text not null check (assignment_role in ('school_admin', 'teacher', 'student', 'homeroom_teacher')),
  is_primary boolean not null default false,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
);

create unique index if not exists profile_assignment_unique
  on public.profile_assignments (
    profile_id,
    organization_id,
    coalesce(academic_year_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(grade_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(section_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(subject_id, '00000000-0000-0000-0000-000000000000'::uuid),
    assignment_role
  );

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email citext not null,
  role text not null check (role in ('school_admin', 'teacher', 'student')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  token_hash text not null,
  invited_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists organization_pending_invite_unique
  on public.organization_invites (organization_id, lower(email::text), role)
  where status = 'pending';

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  action_url text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.organization_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  academic_year_id uuid references public.academic_years(id) on delete set null,
  title text not null,
  description text,
  event_type text not null default 'general',
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint organization_event_dates_valid check (ends_at is null or ends_at >= starts_at)
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.onboarding_progress (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  current_step integer not null default 1 check (current_step between 1 and 7),
  completed_steps integer[] not null default '{}'::integer[],
  data jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists academic_years_org_status_idx on public.academic_years (organization_id, status);
create index if not exists grades_org_order_idx on public.grades (organization_id, sort_order);
create index if not exists sections_org_year_grade_idx on public.sections (organization_id, academic_year_id, grade_id);
create index if not exists organization_subjects_org_name_idx on public.organization_subjects (organization_id, name);
create index if not exists profile_assignments_org_profile_idx on public.profile_assignments (organization_id, profile_id);
create index if not exists profile_assignments_section_idx on public.profile_assignments (section_id) where section_id is not null;
create index if not exists notifications_recipient_unread_idx on public.notifications (recipient_id, created_at desc) where read_at is null;
create index if not exists organization_events_org_start_idx on public.organization_events (organization_id, starts_at);
create index if not exists audit_events_org_created_idx on public.audit_events (organization_id, created_at desc);
create index if not exists profiles_org_role_status_idx on public.profiles (organization_id, role, status);

-- Security helper functions. Service-role operations remain outside these policies.
create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create or replace function public.can_manage_school(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() = 'super_admin'
    or (
      public.current_profile_role() = 'school_admin'
      and public.current_organization_id() = target_organization_id
    );
$$;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_organization_id() to authenticated;
grant execute on function public.can_manage_school(uuid) to authenticated;

alter table public.academic_years enable row level security;
alter table public.grades enable row level security;
alter table public.sections enable row level security;
alter table public.organization_subjects enable row level security;
alter table public.section_subjects enable row level security;
alter table public.profile_assignments enable row level security;
alter table public.organization_invites enable row level security;
alter table public.notifications enable row level security;
alter table public.organization_events enable row level security;
alter table public.audit_events enable row level security;
alter table public.onboarding_progress enable row level security;

-- Re-runnable policy creation.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'academic_years', 'grades', 'sections', 'organization_subjects',
    'section_subjects', 'profile_assignments', 'organization_events'
  ] loop
    execute format('drop policy if exists tenant_read on public.%I', table_name);
    execute format(
      'create policy tenant_read on public.%I for select to authenticated using (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id())',
      table_name
    );
    execute format('drop policy if exists tenant_manage on public.%I', table_name);
    execute format(
      'create policy tenant_manage on public.%I for all to authenticated using (public.can_manage_school(organization_id)) with check (public.can_manage_school(organization_id))',
      table_name
    );
  end loop;
end $$;

drop policy if exists notification_recipient_read on public.notifications;
create policy notification_recipient_read on public.notifications
  for select to authenticated
  using (recipient_id = auth.uid() or public.current_profile_role() = 'super_admin');

drop policy if exists notification_recipient_update on public.notifications;
create policy notification_recipient_update on public.notifications
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

drop policy if exists invite_admin_manage on public.organization_invites;
create policy invite_admin_manage on public.organization_invites
  for all to authenticated
  using (public.can_manage_school(organization_id))
  with check (public.can_manage_school(organization_id));

drop policy if exists audit_tenant_read on public.audit_events;
create policy audit_tenant_read on public.audit_events
  for select to authenticated
  using (public.current_profile_role() = 'super_admin' or organization_id = public.current_organization_id());

drop policy if exists onboarding_admin_manage on public.onboarding_progress;
create policy onboarding_admin_manage on public.onboarding_progress
  for all to authenticated
  using (public.can_manage_school(organization_id))
  with check (public.can_manage_school(organization_id));

comment on table public.academic_years is 'Organization academic calendar; exactly one current year per organization.';
comment on table public.profile_assignments is 'Role-aware person assignments to academic entities without duplicating identity records.';
comment on table public.notifications is 'Durable recipient notifications; Phase 1 UI may use dummy data until producers are connected.';
comment on table public.onboarding_progress is 'Resumable state for the seven-step school onboarding wizard.';
