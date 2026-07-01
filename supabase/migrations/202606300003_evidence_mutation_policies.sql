-- Evidence mutation policies for delete/replace backend actions.
-- Idempotent so it can be applied after a baseline that was already pushed.

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
