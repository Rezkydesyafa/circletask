-- CircleTask MVP database baseline.
-- Source of truth: docs/PRD.md and docs/technical-spec.md.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.task_status as enum (
    'todo',
    'in_progress',
    'submit_review',
    'revision',
    'approved',
    'done'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_priority as enum ('low', 'medium', 'high');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.group_role as enum ('leader', 'member');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.review_status as enum ('approved', 'revision', 'rejected');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.evidence_type as enum ('file', 'link');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_not_blank check (length(trim(email)) > 0)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  join_code text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint groups_name_not_blank check (length(trim(name)) > 0),
  constraint groups_join_code_not_blank check (length(trim(join_code)) > 0)
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.group_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  deadline timestamptz not null,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_title_not_blank check (length(trim(title)) > 0),
  constraint projects_id_group_unique unique (id, group_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid not null references auth.users(id) on delete restrict,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  weight numeric(8, 2) not null check (weight > 0),
  deadline timestamptz not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_not_blank check (length(trim(title)) > 0),
  constraint tasks_project_group_consistency
    foreign key (project_id, group_id)
    references public.projects(id, group_id)
    on delete cascade,
  constraint tasks_approved_fields_consistency
    check (
      (status not in ('approved', 'done') and approved_at is null)
      or
      (status in ('approved', 'done') and approved_by is not null and approved_at is not null)
    )
);

create table if not exists public.task_evidences (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  evidence_type public.evidence_type not null,
  file_path text,
  external_url text,
  file_name text,
  file_size integer check (file_size is null or file_size <= 5242880),
  note text,
  created_at timestamptz not null default now(),
  constraint task_evidences_source_required
    check (
      (evidence_type = 'file' and file_path is not null and external_url is null)
      or
      (evidence_type = 'link' and external_url is not null and file_path is null)
    )
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  comment text not null check (length(trim(comment)) > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.task_reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  reviewed_by uuid not null references auth.users(id) on delete restrict,
  review_status public.review_status not null,
  review_note text,
  created_at timestamptz not null default now(),
  constraint task_reviews_note_required
    check (
      review_status = 'approved'
      or
      (review_note is not null and length(trim(review_note)) > 0)
    )
);

create table if not exists public.task_reassignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  from_user_id uuid not null references auth.users(id) on delete restrict,
  to_user_id uuid not null references auth.users(id) on delete restrict,
  reassigned_by uuid not null references auth.users(id) on delete restrict,
  reason text not null check (length(trim(reason)) > 0),
  created_at timestamptz not null default now(),
  constraint task_reassignments_different_user check (from_user_id <> to_user_id)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete restrict,
  action text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint activity_logs_action_not_blank check (length(trim(action)) > 0)
);

create unique index if not exists projects_id_group_id_idx on public.projects (id, group_id);
create index if not exists group_members_user_id_idx on public.group_members (user_id);
create index if not exists projects_group_id_idx on public.projects (group_id);
create index if not exists tasks_group_project_idx on public.tasks (group_id, project_id);
create index if not exists tasks_assigned_to_idx on public.tasks (assigned_to);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists task_evidences_task_id_idx on public.task_evidences (task_id);
create index if not exists task_comments_task_id_idx on public.task_comments (task_id);
create index if not exists task_reviews_task_id_idx on public.task_reviews (task_id);
create index if not exists task_reassignments_task_id_idx on public.task_reassignments (task_id);
create index if not exists activity_logs_group_created_idx on public.activity_logs (group_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists groups_set_updated_at on public.groups;
create trigger groups_set_updated_at
before update on public.groups
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_email text;
  profile_full_name text;
  profile_avatar_url text;
begin
  profile_email := coalesce(nullif(trim(new.email::text), ''), new.id::text || '@auth.local');
  profile_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(split_part(profile_email, '@', 1), ''),
    'Pengguna CircleTask'
  );
  profile_avatar_url := nullif(trim(new.raw_user_meta_data->>'avatar_url'), '');

  insert into public.profiles (user_id, email, full_name, avatar_url)
  values (new.id, profile_email, profile_full_name, profile_avatar_url)
  on conflict (user_id) do update
  set
    email = excluded.email,
    full_name = public.profiles.full_name,
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists auth_user_sync_profile on auth.users;
create trigger auth_user_sync_profile
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_profile_from_auth_user();

create or replace function public.generate_group_join_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8));
    exit when not exists (
      select 1
      from public.groups g
      where g.join_code = candidate
    );
  end loop;

  return candidate;
end;
$$;

create or replace function public.create_group_with_leader(group_name text, group_description text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  new_group_id uuid;
  new_join_code text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if group_name is null or length(trim(group_name)) = 0 then
    raise exception 'Nama kelompok wajib diisi';
  end if;

  new_group_id := gen_random_uuid();
  new_join_code := public.generate_group_join_code();

  insert into public.groups (id, name, description, join_code, owner_id)
  values (new_group_id, trim(group_name), nullif(trim(group_description), ''), new_join_code, current_user_id);

  insert into public.group_members (group_id, user_id, role)
  values (new_group_id, current_user_id, 'leader');

  insert into public.activity_logs (group_id, user_id, action, description, metadata)
  values (
    new_group_id,
    current_user_id,
    'group.created',
    'Kelompok dibuat',
    jsonb_build_object('join_code', new_join_code)
  );

  return jsonb_build_object(
    'id', new_group_id,
    'join_code', new_join_code,
    'role', 'leader'
  );
end;
$$;

create or replace function public.join_group_by_code(target_join_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  target_group_id uuid;
  normalized_join_code text;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  normalized_join_code := upper(trim(target_join_code));

  if normalized_join_code is null or length(normalized_join_code) = 0 then
    raise exception 'Kode join wajib diisi';
  end if;

  select g.id
  into target_group_id
  from public.groups g
  where g.join_code = normalized_join_code;

  if target_group_id is null then
    raise exception 'Kode join tidak valid';
  end if;

  if exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = current_user_id
  ) then
    raise exception 'User sudah bergabung ke kelompok ini';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (target_group_id, current_user_id, 'member');

  insert into public.activity_logs (group_id, user_id, action, description, metadata)
  values (
    target_group_id,
    current_user_id,
    'group.member_joined',
    'Anggota bergabung ke kelompok',
    '{}'::jsonb
  );

  return jsonb_build_object(
    'id', target_group_id,
    'role', 'member'
  );
end;
$$;

create or replace function public.validate_task_evidence_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    select count(*)
    from public.task_evidences te
    where te.task_id = new.task_id
  ) >= 3 then
    raise exception 'Maksimal 3 bukti pekerjaan per task';
  end if;

  return new;
end;
$$;

drop trigger if exists task_evidences_limit on public.task_evidences;
create trigger task_evidences_limit
before insert on public.task_evidences
for each row execute function public.validate_task_evidence_limit();

create or replace function public.validate_task_submit_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'submit_review' and old.status is distinct from new.status then
    if not exists (
      select 1
      from public.task_evidences te
      where te.task_id = new.id
    ) then
      raise exception 'Task tidak bisa submit review tanpa bukti pekerjaan';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_validate_submit_review on public.tasks;
create trigger tasks_validate_submit_review
before update on public.tasks
for each row execute function public.validate_task_submit_review();

create or replace function public.validate_task_reassignment_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  task_group uuid;
begin
  select t.group_id
  into task_group
  from public.tasks t
  where t.id = new.task_id;

  if task_group is null then
    raise exception 'Task tidak ditemukan';
  end if;

  if not public.is_group_member(task_group, new.from_user_id) then
    raise exception 'Anggota lama bukan member kelompok';
  end if;

  if not public.is_group_member(task_group, new.to_user_id) then
    raise exception 'Anggota baru bukan member kelompok';
  end if;

  return new;
end;
$$;

drop trigger if exists task_reassignments_validate_member on public.task_reassignments;
create trigger task_reassignments_validate_member
before insert on public.task_reassignments
for each row execute function public.validate_task_reassignment_member();

create or replace function public.is_group_member(target_group_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = target_user_id
  );
$$;

create or replace function public.is_group_leader(target_group_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = target_group_id
      and gm.user_id = target_user_id
      and gm.role = 'leader'
  );
$$;

create or replace function public.task_group_id(target_task_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select t.group_id
  from public.tasks t
  where t.id = target_task_id;
$$;

create or replace function public.validate_assigned_member_task_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if public.is_group_leader(old.group_id, auth.uid()) then
    return new;
  end if;

  if old.assigned_to = auth.uid() then
    if new.status not in ('in_progress', 'submit_review', 'revision') then
      raise exception 'Anggota tidak bisa mengubah task ke status ini';
    end if;

    if new.id is distinct from old.id
      or new.project_id is distinct from old.project_id
      or new.group_id is distinct from old.group_id
      or new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.assigned_to is distinct from old.assigned_to
      or new.priority is distinct from old.priority
      or new.weight is distinct from old.weight
      or new.deadline is distinct from old.deadline
      or new.created_by is distinct from old.created_by
      or new.approved_by is distinct from old.approved_by
      or new.approved_at is distinct from old.approved_at then
      raise exception 'Anggota hanya boleh mengubah status task miliknya';
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_validate_assigned_member_update on public.tasks;
create trigger tasks_validate_assigned_member_update
before update on public.tasks
for each row execute function public.validate_assigned_member_task_update();

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_evidences enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_reviews enable row level security;
alter table public.task_reassignments enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (user_id = auth.uid());

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles for insert
with check (user_id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Members can read their groups" on public.groups;
create policy "Members can read their groups"
on public.groups for select
using (public.is_group_member(id));

drop policy if exists "Authenticated users can create groups" on public.groups;
create policy "Authenticated users can create groups"
on public.groups for insert
with check (owner_id = auth.uid());

drop policy if exists "Leaders can update their groups" on public.groups;
create policy "Leaders can update their groups"
on public.groups for update
using (public.is_group_leader(id))
with check (public.is_group_leader(id));

drop policy if exists "Members can read group membership" on public.group_members;
create policy "Members can read group membership"
on public.group_members for select
using (public.is_group_member(group_id));

drop policy if exists "Users can join as member" on public.group_members;

drop policy if exists "Group owner can create leader membership" on public.group_members;
create policy "Group owner can create leader membership"
on public.group_members for insert
with check (
  user_id = auth.uid()
  and role = 'leader'
  and exists (
    select 1
    from public.groups g
    where g.id = group_id
      and g.owner_id = auth.uid()
  )
);

drop policy if exists "Leaders can manage members" on public.group_members;
create policy "Leaders can manage members"
on public.group_members for delete
using (public.is_group_leader(group_id));

drop policy if exists "Members can read group projects" on public.projects;
create policy "Members can read group projects"
on public.projects for select
using (public.is_group_member(group_id));

drop policy if exists "Leaders can create projects" on public.projects;
create policy "Leaders can create projects"
on public.projects for insert
with check (
  created_by = auth.uid()
  and public.is_group_leader(group_id)
);

drop policy if exists "Leaders can update projects" on public.projects;
create policy "Leaders can update projects"
on public.projects for update
using (public.is_group_leader(group_id))
with check (public.is_group_leader(group_id));

drop policy if exists "Members can read group tasks" on public.tasks;
create policy "Members can read group tasks"
on public.tasks for select
using (public.is_group_member(group_id));

drop policy if exists "Leaders can create tasks" on public.tasks;
create policy "Leaders can create tasks"
on public.tasks for insert
with check (
  created_by = auth.uid()
  and public.is_group_leader(group_id)
  and public.is_group_member(group_id, assigned_to)
);

drop policy if exists "Assigned members can update safe task progress" on public.tasks;
create policy "Assigned members can update safe task progress"
on public.tasks for update
using (
  assigned_to = auth.uid()
  and status in ('todo', 'in_progress', 'revision')
)
with check (
  assigned_to = auth.uid()
  and status in ('in_progress', 'submit_review', 'revision')
);

drop policy if exists "Leaders can update group tasks" on public.tasks;
create policy "Leaders can update group tasks"
on public.tasks for update
using (public.is_group_leader(group_id))
with check (public.is_group_leader(group_id));

drop policy if exists "Members can read task evidences" on public.task_evidences;
create policy "Members can read task evidences"
on public.task_evidences for select
using (public.is_group_member(public.task_group_id(task_id)));

drop policy if exists "Assigned members can create task evidences" on public.task_evidences;
create policy "Assigned members can create task evidences"
on public.task_evidences for insert
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1
    from public.tasks t
    where t.id = task_id
      and t.assigned_to = auth.uid()
      and public.is_group_member(t.group_id)
  )
);

drop policy if exists "Evidence owners and leaders can update task evidences" on public.task_evidences;
create policy "Evidence owners and leaders can update task evidences"
on public.task_evidences for update
using (
  public.is_group_member(public.task_group_id(task_id))
  and (
    uploaded_by = auth.uid()
    or public.is_group_leader(public.task_group_id(task_id))
  )
)
with check (
  public.is_group_member(public.task_group_id(task_id))
  and public.is_group_member(public.task_group_id(task_id), uploaded_by)
  and (
    uploaded_by = auth.uid()
    or public.is_group_leader(public.task_group_id(task_id))
  )
);

drop policy if exists "Evidence owners and leaders can delete task evidences" on public.task_evidences;
create policy "Evidence owners and leaders can delete task evidences"
on public.task_evidences for delete
using (
  public.is_group_member(public.task_group_id(task_id))
  and (
    uploaded_by = auth.uid()
    or public.is_group_leader(public.task_group_id(task_id))
  )
);

drop policy if exists "Members can read task comments" on public.task_comments;
create policy "Members can read task comments"
on public.task_comments for select
using (public.is_group_member(public.task_group_id(task_id)));

drop policy if exists "Members can create task comments" on public.task_comments;
create policy "Members can create task comments"
on public.task_comments for insert
with check (
  user_id = auth.uid()
  and public.is_group_member(public.task_group_id(task_id))
);

drop policy if exists "Members can read task reviews" on public.task_reviews;
create policy "Members can read task reviews"
on public.task_reviews for select
using (public.is_group_member(public.task_group_id(task_id)));

drop policy if exists "Leaders can create task reviews" on public.task_reviews;
create policy "Leaders can create task reviews"
on public.task_reviews for insert
with check (
  reviewed_by = auth.uid()
  and public.is_group_leader(public.task_group_id(task_id))
);

drop policy if exists "Members can read task reassignments" on public.task_reassignments;
create policy "Members can read task reassignments"
on public.task_reassignments for select
using (public.is_group_member(public.task_group_id(task_id)));

drop policy if exists "Leaders can create task reassignments" on public.task_reassignments;
create policy "Leaders can create task reassignments"
on public.task_reassignments for insert
with check (
  reassigned_by = auth.uid()
  and public.is_group_leader(public.task_group_id(task_id))
);

drop policy if exists "Members can read group activity logs" on public.activity_logs;
create policy "Members can read group activity logs"
on public.activity_logs for select
using (public.is_group_member(group_id));

drop policy if exists "Members can create group activity logs" on public.activity_logs;
create policy "Members can create group activity logs"
on public.activity_logs for insert
with check (
  user_id = auth.uid()
  and public.is_group_member(group_id)
);
