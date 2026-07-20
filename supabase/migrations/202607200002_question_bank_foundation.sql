-- School-scoped Question Bank foundation. Legacy questions/question_banks are preserved.
create extension if not exists pgcrypto;

create table if not exists public.question_chapters (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  academic_year_id uuid references public.academic_years(id) on delete set null, grade_id uuid not null references public.grades(id) on delete restrict,
  subject_id uuid not null references public.organization_subjects(id) on delete restrict, name text not null, description text,
  sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (organization_id, grade_id, subject_id, name)
);

create table if not exists public.question_topics (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  chapter_id uuid not null references public.question_chapters(id) on delete cascade, name text not null, description text,
  sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (chapter_id, name)
);

create table if not exists public.question_bank_items (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  academic_year_id uuid references public.academic_years(id) on delete set null, grade_id uuid not null references public.grades(id) on delete restrict,
  subject_id uuid not null references public.organization_subjects(id) on delete restrict, chapter_id uuid references public.question_chapters(id) on delete set null,
  topic_id uuid references public.question_topics(id) on delete set null, title text not null, body jsonb not null default '{}'::jsonb,
  body_text text not null default '', question_type text not null check (question_type in ('multiple_choice','multiple_select','true_false','fill_blank','numerical','short_answer','long_answer')),
  difficulty text not null default 'medium' check (difficulty in ('easy','medium','hard')), marks numeric(8,2) not null default 1 check (marks >= 0),
  negative_marks numeric(8,2) not null default 0 check (negative_marks >= 0), estimated_seconds integer check (estimated_seconds is null or estimated_seconds > 0),
  language_code text not null default 'en', status text not null default 'draft' check (status in ('draft','review','approved','archived')),
  bloom_level text check (bloom_level is null or bloom_level in ('remember','understand','apply','analyze','evaluate','create')),
  explanation jsonb not null default '{}'::jsonb, explanation_text text not null default '', hints jsonb not null default '[]'::jsonb,
  author_id uuid not null references public.profiles(id) on delete restrict, reviewer_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz, approved_at timestamptz, archived_at timestamptz, last_used_at timestamptz, usage_count bigint not null default 0 check (usage_count >= 0),
  source_kind text not null default 'manual', source_reference text, current_revision integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  search_document tsvector generated always as (setweight(to_tsvector('simple', coalesce(title,'')), 'A') || setweight(to_tsvector('simple', coalesce(body_text,'')), 'B') || setweight(to_tsvector('simple', coalesce(explanation_text,'')), 'C')) stored
);

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  question_id uuid not null references public.question_bank_items(id) on delete cascade, content jsonb not null default '{}'::jsonb,
  content_text text not null default '', is_correct boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (question_id, sort_order)
);

create table if not exists public.question_answers (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  question_id uuid not null references public.question_bank_items(id) on delete cascade, answer_kind text not null,
  answer_data jsonb not null default '{}'::jsonb, grading_guidance text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.question_taxonomy_terms (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  kind text not null check (kind in ('learning_outcome','skill','tag')), name text not null, description text, created_at timestamptz not null default now(),
  unique (organization_id, kind, name)
);

create table if not exists public.question_taxonomy_links (
  organization_id uuid not null references public.organizations(id) on delete cascade, question_id uuid not null references public.question_bank_items(id) on delete cascade,
  term_id uuid not null references public.question_taxonomy_terms(id) on delete cascade, created_at timestamptz not null default now(), primary key (question_id, term_id)
);

create table if not exists public.question_attachments (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  question_id uuid not null references public.question_bank_items(id) on delete cascade, storage_path text not null, file_name text not null,
  mime_type text not null, size_bytes bigint not null check (size_bytes > 0), attachment_kind text not null default 'supporting', uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), unique (question_id, storage_path)
);

create table if not exists public.question_collections (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null, description text, color text, owner_id uuid references public.profiles(id) on delete set null,
  visibility text not null default 'organization' check (visibility in ('private','organization')), archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (organization_id, name)
);

create table if not exists public.question_collection_items (
  organization_id uuid not null references public.organizations(id) on delete cascade, collection_id uuid not null references public.question_collections(id) on delete cascade,
  question_id uuid not null references public.question_bank_items(id) on delete cascade, added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), primary key (collection_id, question_id)
);

create table if not exists public.question_revisions (
  id bigint generated always as identity primary key, organization_id uuid not null references public.organizations(id) on delete cascade,
  question_id uuid not null references public.question_bank_items(id) on delete cascade, revision_number integer not null,
  snapshot jsonb not null, change_summary text, created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(),
  unique (question_id, revision_number)
);

create index if not exists qb_items_search_idx on public.question_bank_items using gin(search_document);
create index if not exists qb_items_org_updated_idx on public.question_bank_items (organization_id, updated_at desc, id);
create index if not exists qb_items_org_filters_idx on public.question_bank_items (organization_id, status, subject_id, grade_id, difficulty, question_type);
create index if not exists qb_items_org_author_idx on public.question_bank_items (organization_id, author_id, updated_at desc);
create index if not exists qb_items_chapter_topic_idx on public.question_bank_items (chapter_id, topic_id) where archived_at is null;
create index if not exists qb_options_question_idx on public.question_options (question_id, sort_order);
create index if not exists qb_taxonomy_term_idx on public.question_taxonomy_links (term_id, question_id);
create index if not exists qb_collection_question_idx on public.question_collection_items (question_id, collection_id);
create index if not exists qb_revisions_question_idx on public.question_revisions (question_id, revision_number desc);

do $$ declare relation_name text; begin
  foreach relation_name in array array['question_chapters','question_topics','question_bank_items','question_options','question_answers','question_taxonomy_terms','question_taxonomy_links','question_attachments','question_collections','question_collection_items','question_revisions'] loop
    execute format('alter table public.%I enable row level security', relation_name);
    execute format('drop policy if exists qb_tenant_read on public.%I', relation_name);
    execute format('create policy qb_tenant_read on public.%I for select to authenticated using ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id()))', relation_name);
    execute format('drop policy if exists qb_teacher_manage on public.%I', relation_name);
    execute format('create policy qb_teacher_manage on public.%I for all to authenticated using ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id())) with check ((public.current_profile_role() in (''super_admin'',''school_admin'',''teacher'')) and (public.current_profile_role() = ''super_admin'' or organization_id = public.current_organization_id()))', relation_name);
  end loop;
end $$;

comment on table public.question_bank_items is 'Canonical school Question Bank; intentionally separate from legacy competitive-exam questions.';
comment on table public.question_collection_items is 'Reference-only collection membership; question content is never duplicated.';
