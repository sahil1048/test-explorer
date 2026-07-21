-- Phase 9: production SaaS operations. Additive; previous product data is preserved.
alter table public.organizations
  add column if not exists lifecycle_status text not null default 'active',
  add column if not exists suspended_at timestamptz,
  add column if not exists suspended_by uuid references public.profiles(id) on delete set null,
  add column if not exists suspension_reason text,
  add column if not exists billing_email citext,
  add column if not exists default_language text not null default 'en',
  add column if not exists working_days smallint[] not null default array[1,2,3,4,5,6],
  add column if not exists grading_scheme jsonb not null default '{}'::jsonb,
  add constraint organizations_lifecycle_status_check check (lifecycle_status in ('trial','active','past_due','suspended','closed'));

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(), key text not null unique, name text not null,
  description text, status text not null default 'active' check (status in ('draft','active','archived')),
  currency text not null default 'INR', amount_minor bigint not null default 0 check (amount_minor >= 0),
  interval text not null default 'month' check (interval in ('month','year','custom')),
  trial_days integer not null default 0 check (trial_days >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.plan_entitlements (
  id uuid primary key default gen_random_uuid(), plan_id uuid not null references public.subscription_plans(id) on delete cascade,
  entitlement_key text not null, value jsonb not null, created_at timestamptz not null default now(), unique(plan_id,entitlement_key)
);
create table if not exists public.billing_customers (
  organization_id uuid primary key references public.organizations(id) on delete cascade, provider_key text,
  provider_customer_id text, legal_name text, billing_email citext, tax_id text, address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(provider_key,provider_customer_id)
);
create table if not exists public.organization_subscriptions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict, status text not null check (status in ('trialing','active','past_due','paused','cancelled','expired')),
  provider_key text, provider_subscription_id text, current_period_start timestamptz, current_period_end timestamptz,
  trial_ends_at timestamptz, cancel_at_period_end boolean not null default false, cancelled_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(provider_key,provider_subscription_id)
);
create unique index if not exists one_current_subscription_per_org on public.organization_subscriptions(organization_id) where status in ('trialing','active','past_due','paused');
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id uuid references public.organization_subscriptions(id) on delete set null, provider_key text, provider_invoice_id text,
  number text, status text not null check (status in ('draft','open','paid','void','uncollectible','refunded')),
  currency text not null, subtotal_minor bigint not null default 0, tax_minor bigint not null default 0, total_minor bigint not null default 0,
  due_at timestamptz, paid_at timestamptz, hosted_url text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), unique(provider_key,provider_invoice_id)
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null, provider_key text, provider_payment_id text,
  status text not null check (status in ('pending','succeeded','failed','refunded','partially_refunded')),
  amount_minor bigint not null check(amount_minor >= 0), currency text not null, paid_at timestamptz, failure_code text,
  created_at timestamptz not null default now(), unique(provider_key,provider_payment_id)
);
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(), code citext not null unique, percent_off numeric(5,2), amount_off_minor bigint,
  currency text, valid_from timestamptz, valid_until timestamptz, max_redemptions integer, active boolean not null default true,
  created_at timestamptz not null default now(), check ((percent_off is not null) <> (amount_off_minor is not null))
);
create table if not exists public.subscription_coupons (
  subscription_id uuid not null references public.organization_subscriptions(id) on delete cascade, coupon_id uuid not null references public.coupons(id) on delete restrict,
  applied_at timestamptz not null default now(), primary key(subscription_id,coupon_id)
);
create table if not exists public.organization_licenses (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  student_seats integer not null default 0, teacher_seats integer not null default 0, storage_bytes bigint not null default 0,
  ai_credits bigint not null default 0, api_access boolean not null default false, advanced_analytics boolean not null default false,
  white_label boolean not null default false, updated_at timestamptz not null default now(),
  check(student_seats >= 0 and teacher_seats >= 0 and storage_bytes >= 0 and ai_credits >= 0)
);

create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(), key text not null unique, name text not null, description text,
  enabled_globally boolean not null default false, rollout_percentage smallint not null default 0 check(rollout_percentage between 0 and 100),
  created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.plan_feature_flags (
  plan_id uuid not null references public.subscription_plans(id) on delete cascade, flag_id uuid not null references public.feature_flags(id) on delete cascade,
  enabled boolean not null default true, primary key(plan_id,flag_id)
);
create table if not exists public.organization_feature_flags (
  organization_id uuid not null references public.organizations(id) on delete cascade, flag_id uuid not null references public.feature_flags(id) on delete cascade,
  enabled boolean not null, reason text, expires_at timestamptz, updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(), primary key(organization_id,flag_id)
);

create table if not exists public.custom_roles (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, description text, permission_group text, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,name)
);
create table if not exists public.role_permissions (
  role_id uuid not null references public.custom_roles(id) on delete cascade, permission_key text not null,
  created_at timestamptz not null default now(), primary key(role_id,permission_key)
);
create table if not exists public.profile_role_assignments (
  organization_id uuid not null references public.organizations(id) on delete cascade, profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.custom_roles(id) on delete cascade, assigned_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz, created_at timestamptz not null default now(), primary key(profile_id,role_id)
);
alter table public.custom_roles add constraint custom_roles_id_organization_unique unique(id,organization_id);
alter table public.profile_role_assignments add constraint profile_role_assignment_role_tenant_fk foreign key(role_id,organization_id) references public.custom_roles(id,organization_id) on delete cascade;

alter table public.audit_events add column if not exists resource_type text, add column if not exists resource_id text,
  add column if not exists request_id text, add column if not exists ip_address inet, add column if not exists user_agent text;
create table if not exists public.security_events (
  id bigint generated always as identity primary key, organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null, event_type text not null, severity text not null default 'info' check(severity in ('info','warning','critical')),
  ip_address inet, user_agent text, device_fingerprint_hash text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.user_devices (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade, fingerprint_hash text not null, name text,
  trusted_at timestamptz, last_seen_at timestamptz not null default now(), revoked_at timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), unique(user_id,fingerprint_hash)
);
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade, auth_session_id text not null unique,
  device_id uuid references public.user_devices(id) on delete set null, ip_address inet, user_agent text,
  last_seen_at timestamptz not null default now(), expires_at timestamptz, revoked_at timestamptz, created_at timestamptz not null default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null check(kind in ('google_workspace','microsoft_365','rest_api','webhook','csv_sync','sis')),
  name text not null, status text not null default 'disconnected' check(status in ('disconnected','connecting','active','degraded','disabled')),
  scopes text[] not null default '{}', secret_reference text, configuration jsonb not null default '{}'::jsonb, sync_cursor text,
  last_synced_at timestamptz, last_error text, created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(organization_id,name)
);
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, key_prefix text not null, key_hash text not null unique, scopes text[] not null default '{}', rate_limit_per_minute integer not null default 60,
  last_used_at timestamptz, expires_at timestamptz, revoked_at timestamptz, created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.api_usage_daily (
  organization_id uuid not null references public.organizations(id) on delete cascade, api_key_id uuid references public.api_keys(id) on delete set null,
  usage_date date not null, request_count bigint not null default 0, error_count bigint not null default 0, primary key(organization_id,api_key_id,usage_date)
);
create table if not exists public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  url text not null, signing_secret_reference text not null, events text[] not null, active boolean not null default true,
  created_at timestamptz not null default now(), unique(organization_id,url)
);
create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  endpoint_id uuid not null references public.webhook_endpoints(id) on delete cascade, event_id text not null, status text not null default 'pending',
  attempts integer not null default 0, response_code integer, last_error text, next_attempt_at timestamptz, created_at timestamptz not null default now(), unique(endpoint_id,event_id)
);

create table if not exists public.backup_policies (
  organization_id uuid primary key references public.organizations(id) on delete cascade, frequency text not null default 'daily',
  retention_days integer not null default 30 check(retention_days > 0), export_enabled boolean not null default true, updated_at timestamptz not null default now()
);
create table if not exists public.backup_runs (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade,
  kind text not null check(kind in ('scheduled','manual','export')), status text not null default 'queued', storage_reference text,
  started_at timestamptz, completed_at timestamptz, expires_at timestamptz, error text, created_at timestamptz not null default now()
);
create table if not exists public.restore_requests (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  backup_run_id uuid references public.backup_runs(id) on delete set null, requested_by uuid references public.profiles(id) on delete set null,
  status text not null default 'requested' check(status in ('requested','approved','running','completed','rejected','failed')),
  reason text not null, reviewed_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), completed_at timestamptz
);
create table if not exists public.background_jobs (
  id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations(id) on delete cascade,
  queue text not null, job_type text not null, idempotency_key text, status text not null default 'queued' check(status in ('queued','running','completed','failed','dead_letter','cancelled')),
  attempts integer not null default 0, max_attempts integer not null default 5, available_at timestamptz not null default now(), started_at timestamptz,
  completed_at timestamptz, last_error text, payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), unique(organization_id,idempotency_key)
);
create table if not exists public.system_health_snapshots (
  id bigint generated always as identity primary key, component text not null, status text not null check(status in ('healthy','degraded','down')),
  latency_ms integer, details jsonb not null default '{}'::jsonb, recorded_at timestamptz not null default now()
);

create index if not exists subscriptions_org_status_idx on public.organization_subscriptions(organization_id,status,updated_at desc);
create index if not exists invoices_org_created_idx on public.invoices(organization_id,created_at desc);
create index if not exists audit_events_resource_idx on public.audit_events(organization_id,resource_type,resource_id,created_at desc);
create index if not exists security_events_org_created_idx on public.security_events(organization_id,created_at desc);
create index if not exists jobs_queue_ready_idx on public.background_jobs(queue,available_at) where status in ('queued','failed');
create index if not exists webhook_delivery_ready_idx on public.webhook_deliveries(next_attempt_at) where status in ('pending','failed');

do $$ declare relation_name text; begin foreach relation_name in array array[
  'billing_customers','organization_subscriptions','invoices','payments','organization_licenses','organization_feature_flags',
  'custom_roles','profile_role_assignments','security_events','user_devices','user_sessions','integrations','api_keys','api_usage_daily',
  'webhook_endpoints','webhook_deliveries','backup_policies','backup_runs','restore_requests','background_jobs'
] loop execute format('alter table public.%I enable row level security',relation_name); end loop; end $$;
alter table public.subscription_plans enable row level security; alter table public.plan_entitlements enable row level security;
alter table public.feature_flags enable row level security; alter table public.plan_feature_flags enable row level security;
alter table public.coupons enable row level security; alter table public.subscription_coupons enable row level security;
alter table public.custom_roles enable row level security; alter table public.role_permissions enable row level security;
alter table public.system_health_snapshots enable row level security;

do $$ declare relation_name text; begin foreach relation_name in array array[
  'custom_roles','profile_role_assignments','integrations','api_keys','webhook_endpoints','backup_policies','restore_requests'
] loop
  execute format('create policy tenant_admin_access on public.%I for all to authenticated using (public.current_profile_role() = ''super_admin'' or (public.current_profile_role() = ''school_admin'' and organization_id = public.current_organization_id())) with check (public.current_profile_role() = ''super_admin'' or (public.current_profile_role() = ''school_admin'' and organization_id = public.current_organization_id()))',relation_name);
end loop; end $$;
do $$ declare relation_name text; begin foreach relation_name in array array[
  'billing_customers','organization_subscriptions','invoices','payments','organization_licenses','organization_feature_flags','api_usage_daily','backup_runs'
] loop
  execute format('create policy tenant_admin_read on public.%I for select to authenticated using (public.current_profile_role() = ''super_admin'' or (public.current_profile_role() = ''school_admin'' and organization_id = public.current_organization_id()))',relation_name);
end loop; end $$;
create policy own_devices on public.user_devices for select to authenticated using(user_id=auth.uid() or public.current_profile_role()='super_admin');
create policy own_sessions on public.user_sessions for select to authenticated using(user_id=auth.uid() or public.current_profile_role()='super_admin');
create policy tenant_security_read on public.security_events for select to authenticated using(public.current_profile_role()='super_admin' or (public.current_profile_role()='school_admin' and organization_id=public.current_organization_id()));
create policy public_plan_read on public.subscription_plans for select to authenticated using(status='active' or public.current_profile_role()='super_admin');
create policy public_entitlement_read on public.plan_entitlements for select to authenticated using(true);
create policy platform_flags_read on public.feature_flags for select to authenticated using(true);
create policy platform_plan_flags_read on public.plan_feature_flags for select to authenticated using(true);
create policy platform_plan_manage on public.subscription_plans for all to authenticated using(public.current_profile_role()='super_admin') with check(public.current_profile_role()='super_admin');
create policy platform_entitlement_manage on public.plan_entitlements for all to authenticated using(public.current_profile_role()='super_admin') with check(public.current_profile_role()='super_admin');
create policy platform_flag_manage on public.feature_flags for all to authenticated using(public.current_profile_role()='super_admin') with check(public.current_profile_role()='super_admin');
create policy platform_plan_flag_manage on public.plan_feature_flags for all to authenticated using(public.current_profile_role()='super_admin') with check(public.current_profile_role()='super_admin');
create policy platform_coupon_manage on public.coupons for all to authenticated using(public.current_profile_role()='super_admin') with check(public.current_profile_role()='super_admin');
create policy platform_subscription_coupon_manage on public.subscription_coupons for all to authenticated using(public.current_profile_role()='super_admin') with check(public.current_profile_role()='super_admin');
create policy platform_org_flag_manage on public.organization_feature_flags for all to authenticated using(public.current_profile_role()='super_admin') with check(public.current_profile_role()='super_admin');
create policy tenant_role_permissions on public.role_permissions for all to authenticated using(exists(select 1 from public.custom_roles role where role.id=role_permissions.role_id and (public.current_profile_role()='super_admin' or (public.current_profile_role()='school_admin' and role.organization_id=public.current_organization_id())))) with check(exists(select 1 from public.custom_roles role where role.id=role_permissions.role_id and (public.current_profile_role()='super_admin' or (public.current_profile_role()='school_admin' and role.organization_id=public.current_organization_id()))));
create policy platform_operations on public.system_health_snapshots for all to authenticated using(public.current_profile_role()='super_admin') with check(public.current_profile_role()='super_admin');

comment on table public.organization_licenses is 'Purchased limits only. Utilization is derived from active tenant users and pending invitations.';
comment on table public.api_keys is 'Stores API key hashes and safe prefixes; raw credentials are shown once and never persisted.';
