-- CircleTask Supabase Storage baseline for task evidence files.
-- Kept in migrations so `supabase db push` / `supabase db reset` applies storage setup too.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-evidences',
  'task-evidences',
  false,
  5242880,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Members can read task evidence files" on storage.objects;
create policy "Members can read task evidence files"
on storage.objects for select
using (
  bucket_id = 'task-evidences'
  and exists (
    select 1
    from public.tasks t
    where t.group_id::text = split_part(name, '/', 1)
      and t.project_id::text = split_part(name, '/', 2)
      and t.id::text = split_part(name, '/', 3)
      and public.is_group_member(t.group_id)
  )
);

drop policy if exists "Assigned members can upload task evidence files" on storage.objects;
create policy "Assigned members can upload task evidence files"
on storage.objects for insert
with check (
  bucket_id = 'task-evidences'
  and exists (
    select 1
    from public.tasks t
    where t.group_id::text = split_part(name, '/', 1)
      and t.project_id::text = split_part(name, '/', 2)
      and t.id::text = split_part(name, '/', 3)
      and t.assigned_to = auth.uid()
      and public.is_group_member(t.group_id)
  )
);

drop policy if exists "Assigned members and leaders can delete task evidence files" on storage.objects;
create policy "Assigned members and leaders can delete task evidence files"
on storage.objects for delete
using (
  bucket_id = 'task-evidences'
  and exists (
    select 1
    from public.tasks t
    where t.group_id::text = split_part(name, '/', 1)
      and t.project_id::text = split_part(name, '/', 2)
      and t.id::text = split_part(name, '/', 3)
      and (
        t.assigned_to = auth.uid()
        or public.is_group_leader(t.group_id)
      )
      and public.is_group_member(t.group_id)
  )
);
