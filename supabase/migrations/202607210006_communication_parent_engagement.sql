-- Event-driven contextual communication and read-only parent engagement.
create table if not exists public.communications (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  type text not null check (type in ('announcement','notification','reminder','academic_update','system_message','result_update','upcoming_assessment','school_event')),
  title text not null, description text not null, priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')), created_by uuid not null references public.profiles(id) on delete restrict,
  publish_at timestamptz, published_at timestamptz, expires_at timestamptz, source_event_id uuid, replaces_communication_id uuid references public.communications(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (expires_at is null or publish_at is null or expires_at > publish_at)
);
create table if not exists public.communication_audiences (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, communication_id uuid not null references public.communications(id) on delete cascade,
  audience_type text not null check (audience_type in ('organization','role','grade','section','class','subject','student','parent')), audience_id text,
  created_at timestamptz not null default now(), unique (communication_id,audience_type,audience_id)
);
create table if not exists public.communication_recipients (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, communication_id uuid not null references public.communications(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade, delivered_at timestamptz, read_at timestamptz, acknowledged_at timestamptz,
  created_at timestamptz not null default now(), unique (communication_id,recipient_id)
);
create table if not exists public.communication_deliveries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, recipient_id uuid not null references public.communication_recipients(id) on delete cascade,
  channel text not null check (channel in ('in_app','email','push','sms')), status text not null default 'pending' check (status in ('pending','processing','delivered','failed','suppressed','cancelled')),
  provider_key text, provider_message_id text, attempts integer not null default 0, last_error text, available_at timestamptz not null default now(), delivered_at timestamptz, created_at timestamptz not null default now(),
  unique (recipient_id,channel)
);
create table if not exists public.communication_templates (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, name text not null,
  template_key text, category text not null check (category in ('assessment_reminder','result_release','homework_reminder','academic_alert','parent_meeting','general_announcement')),
  title_template text not null, body_template text not null, variables jsonb not null default '[]'::jsonb, owner_id uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id,name)
);
create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade, organization_id uuid not null references public.organizations(id) on delete cascade,
  in_app_enabled boolean not null default true, email_enabled boolean not null default true, push_enabled boolean not null default false, sms_enabled boolean not null default false,
  reminder_frequency text not null default 'standard' check (reminder_frequency in ('minimal','standard','frequent')), digest_mode text not null default 'off' check (digest_mode in ('off','daily','weekly')),
  quiet_hours jsonb not null default '{}'::jsonb, event_overrides jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
create table if not exists public.communication_events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type text not null check (event_type in ('assessment_assigned','assessment_due_soon','assessment_started','assessment_submitted','result_released','feedback_published','announcement_published','teacher_mention','academic_warning','system_maintenance')),
  source_type text not null, source_id text, idempotency_key text not null, payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','processing','processed','failed','cancelled')), available_at timestamptz not null default now(), processed_at timestamptz, created_at timestamptz not null default now(),
  unique (organization_id,idempotency_key)
);
create table if not exists public.parent_student_links (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade, relationship text, status text not null default 'pending' check (status in ('pending','verified','revoked')),
  verified_by uuid references public.profiles(id) on delete set null, verified_at timestamptz, created_at timestamptz not null default now(), unique (parent_id,student_id)
);
create table if not exists public.calendar_entries (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  entry_type text not null check (entry_type in ('assessment','deadline','school_event','holiday','announcement')), source_type text, source_id text,
  title text not null, description text, starts_at timestamptz not null, ends_at timestamptz, all_day boolean not null default false,
  audience jsonb not null default '[]'::jsonb, created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at), unique (organization_id,source_type,source_id,entry_type)
);
create table if not exists public.communication_attachments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, communication_id uuid not null references public.communications(id) on delete cascade,
  storage_path text not null, file_name text not null, mime_type text not null, size_bytes bigint not null check (size_bytes > 0), created_at timestamptz not null default now(), unique (communication_id,storage_path)
);
create index if not exists communications_org_status_idx on public.communications (organization_id,status,publish_at desc);
create index if not exists recipients_user_unread_idx on public.communication_recipients (recipient_id,created_at desc) where read_at is null;
create index if not exists delivery_queue_idx on public.communication_deliveries (status,available_at) where status in ('pending','failed');
create index if not exists communication_history_idx on public.communication_recipients (organization_id,created_at desc,communication_id);
create index if not exists parent_links_parent_idx on public.parent_student_links (organization_id,parent_id,status);
create index if not exists calendar_org_start_idx on public.calendar_entries (organization_id,starts_at,entry_type);
do $$ declare relation_name text; begin foreach relation_name in array array['communications','communication_audiences','communication_recipients','communication_deliveries','communication_templates','notification_preferences','communication_events','parent_student_links','calendar_entries','communication_attachments'] loop execute format('alter table public.%I enable row level security',relation_name);end loop;end $$;
drop policy if exists communication_staff_manage on public.communications;create policy communication_staff_manage on public.communications for all to authenticated using ((public.current_profile_role() in ('super_admin','school_admin','teacher')) and (public.current_profile_role()='super_admin' or organization_id=public.current_organization_id())) with check ((public.current_profile_role() in ('super_admin','school_admin','teacher')) and (public.current_profile_role()='super_admin' or organization_id=public.current_organization_id()));
drop policy if exists communication_recipient_read on public.communications;create policy communication_recipient_read on public.communications for select to authenticated using (exists (select 1 from public.communication_recipients recipient where recipient.communication_id=communications.id and recipient.recipient_id=auth.uid()));
do $$ declare relation_name text; begin foreach relation_name in array array['communication_audiences','communication_templates','communication_events','communication_attachments'] loop execute format('drop policy if exists communication_staff_related on public.%I',relation_name);execute format('create policy communication_staff_related on public.%I for all to authenticated using ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role()=''super_admin'' or organization_id=public.current_organization_id())) with check ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role()=''super_admin'' or organization_id=public.current_organization_id()))',relation_name);end loop;end $$;
drop policy if exists recipient_read_own on public.communication_recipients;create policy recipient_read_own on public.communication_recipients for select to authenticated using (recipient_id=auth.uid() or (public.current_profile_role() in ('super_admin','school_admin') and organization_id=public.current_organization_id()));
drop policy if exists delivery_admin_read on public.communication_deliveries;create policy delivery_admin_read on public.communication_deliveries for select to authenticated using (public.current_profile_role() in ('super_admin','school_admin') and (public.current_profile_role()='super_admin' or organization_id=public.current_organization_id()));
drop policy if exists calendar_tenant_read on public.calendar_entries;create policy calendar_tenant_read on public.calendar_entries for select to authenticated using (public.current_profile_role()='super_admin' or organization_id=public.current_organization_id());
drop policy if exists calendar_staff_manage on public.calendar_entries;create policy calendar_staff_manage on public.calendar_entries for all to authenticated using ((public.current_profile_role() in ('super_admin','school_admin','teacher')) and (public.current_profile_role()='super_admin' or organization_id=public.current_organization_id())) with check ((public.current_profile_role() in ('super_admin','school_admin','teacher')) and (public.current_profile_role()='super_admin' or organization_id=public.current_organization_id()));
drop policy if exists preferences_own on public.notification_preferences;create policy preferences_own on public.notification_preferences for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid() and organization_id=public.current_organization_id());
drop policy if exists parent_links_own on public.parent_student_links;create policy parent_links_own on public.parent_student_links for select to authenticated using (parent_id=auth.uid() or (public.current_profile_role() in ('super_admin','school_admin') and organization_id=public.current_organization_id()));
comment on table public.communication_events is 'Idempotent domain-event inbox/outbox; communication originates from platform context, not chat.';
