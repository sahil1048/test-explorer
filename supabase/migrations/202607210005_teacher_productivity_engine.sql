-- Provider-neutral, teacher-controlled productivity assistance.
create table if not exists public.productivity_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, requested_by uuid not null references public.profiles(id) on delete cascade,
  operation text not null, entity_type text, entity_id text, normalized_input_hash text not null, context_refs jsonb not null default '[]'::jsonb,
  prompt_key text not null, prompt_version integer not null, status text not null default 'queued' check (status in ('queued','processing','completed','failed','cancelled','expired')),
  idempotency_key text not null, error_code text, created_at timestamptz not null default now(), completed_at timestamptz, expires_at timestamptz, unique (organization_id, idempotency_key)
);
create table if not exists public.productivity_generations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, request_id uuid not null references public.productivity_requests(id) on delete cascade,
  provider_key text not null, model_key text not null, provider_request_id text, output jsonb not null, citations jsonb not null default '[]'::jsonb,
  schema_version integer not null default 1, parent_generation_id uuid references public.productivity_generations(id) on delete set null,
  input_tokens integer, output_tokens integer, cost_micros bigint, latency_ms integer, created_at timestamptz not null default now()
);
create table if not exists public.productivity_suggestions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, generation_id uuid not null references public.productivity_generations(id) on delete cascade,
  target_entity_type text not null, target_entity_id text, target_field text not null, proposed_value jsonb not null, edited_value jsonb,
  status text not null default 'ready' check (status in ('ready','edited','applied','approved','rejected','expired')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.productivity_approvals (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade, suggestion_id uuid not null references public.productivity_suggestions(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete restrict, action text not null check (action in ('edited','applied','approved','rejected','reverted')),
  value_hash text, note text, created_at timestamptz not null default now()
);
create table if not exists public.productivity_usage_daily (
  organization_id uuid not null references public.organizations(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
  usage_date date not null, operation text not null, request_count integer not null default 0, success_count integer not null default 0, applied_count integer not null default 0,
  approved_count integer not null default 0, rejected_count integer not null default 0, input_tokens bigint not null default 0, output_tokens bigint not null default 0,
  cost_micros bigint not null default 0, estimated_seconds_saved bigint not null default 0, primary key (organization_id,user_id,usage_date,operation)
);
create table if not exists public.saved_productivity_views (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, owner_id uuid not null references public.profiles(id) on delete cascade,
  feature_key text not null, name text not null, query text, filters jsonb not null default '{}'::jsonb, is_pinned boolean not null default false,
  last_used_at timestamptz not null default now(), created_at timestamptz not null default now(), unique (owner_id,feature_key,name)
);
create table if not exists public.user_content_favorites (
  organization_id uuid not null references public.organizations(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
  entity_type text not null check (entity_type in ('question','collection','assessment_template','feedback_template','rubric')), entity_id uuid not null,
  created_at timestamptz not null default now(), primary key (user_id,entity_type,entity_id)
);
create index if not exists productivity_requests_queue_idx on public.productivity_requests (status, created_at) where status in ('queued','processing');
create index if not exists productivity_requests_entity_idx on public.productivity_requests (organization_id,entity_type,entity_id,created_at desc);
create index if not exists productivity_suggestions_target_idx on public.productivity_suggestions (organization_id,target_entity_type,target_entity_id,status);
create index if not exists productivity_usage_org_date_idx on public.productivity_usage_daily (organization_id,usage_date desc,operation);
do $$ declare relation_name text; begin foreach relation_name in array array['productivity_requests','productivity_generations','productivity_suggestions','productivity_approvals','productivity_usage_daily','saved_productivity_views','user_content_favorites'] loop execute format('alter table public.%I enable row level security',relation_name);execute format('drop policy if exists productivity_tenant_access on public.%I',relation_name);execute format('create policy productivity_tenant_access on public.%I for all to authenticated using ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id())) with check ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id()))',relation_name);end loop;end $$;
comment on table public.productivity_suggestions is 'Generated proposals remain separate from canonical domain records until explicit teacher action.';
comment on table public.productivity_usage_daily is 'Measures cost and estimated teacher time saved; feature count is not a success metric.';
