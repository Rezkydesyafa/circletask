-- CircleTask realistic MVP seed for local Supabase development.
-- Default password for all seeded auth users: CircleTask123!

create extension if not exists "pgcrypto";

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    'authenticated',
    'authenticated',
    'leader@circletask.test',
    crypt('CircleTask123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Nadia Ketua"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b6f4c68c-c38b-4c09-9291-f5c0c716f102',
    'authenticated',
    'authenticated',
    'member-a@circletask.test',
    crypt('CircleTask123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Bima Anggota"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'e2d9e084-ec4e-46cf-8cc0-6ccf0d8df103',
    'authenticated',
    'authenticated',
    'member-b@circletask.test',
    crypt('CircleTask123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Citra Anggota"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '574c4254-5ef1-4efd-936a-4623b0e3f104',
    'authenticated',
    'authenticated',
    'outsider@circletask.test',
    crypt('CircleTask123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Raka Non Member"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

do $$
declare
  seed_user record;
  identity_id_type text;
  has_provider_id boolean;
begin
  select data_type
  into identity_id_type
  from information_schema.columns
  where table_schema = 'auth'
    and table_name = 'identities'
    and column_name = 'id';

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'identities'
      and column_name = 'provider_id'
  )
  into has_provider_id;

  for seed_user in
    select *
    from (
      values
        ('9b7d0fa1-8e47-4e83-8c79-2edb2a58f101'::uuid, 'leader@circletask.test'),
        ('b6f4c68c-c38b-4c09-9291-f5c0c716f102'::uuid, 'member-a@circletask.test'),
        ('e2d9e084-ec4e-46cf-8cc0-6ccf0d8df103'::uuid, 'member-b@circletask.test'),
        ('574c4254-5ef1-4efd-936a-4623b0e3f104'::uuid, 'outsider@circletask.test')
    ) as users(id, email)
  loop
    if has_provider_id then
      execute format(
        'insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
         values (%s, $1, $2, jsonb_build_object(''sub'', $2, ''email'', $3, ''email_verified'', true), ''email'', now(), now(), now())
         on conflict do nothing',
        case
          when identity_id_type = 'uuid' then 'gen_random_uuid()'
          else '$2'
        end
      )
      using seed_user.id, seed_user.id::text, seed_user.email;
    else
      execute format(
        'insert into auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
         values (%s, $1, jsonb_build_object(''sub'', $2, ''email'', $3, ''email_verified'', true), ''email'', now(), now(), now())
         on conflict do nothing',
        case
          when identity_id_type = 'uuid' then 'gen_random_uuid()'
          else '$2'
        end
      )
      using seed_user.id, seed_user.id::text, seed_user.email;
    end if;
  end loop;
end $$;

insert into public.profiles (user_id, email, full_name, avatar_url)
values
  ('9b7d0fa1-8e47-4e83-8c79-2edb2a58f101', 'leader@circletask.test', 'Nadia Ketua', null),
  ('b6f4c68c-c38b-4c09-9291-f5c0c716f102', 'member-a@circletask.test', 'Bima Anggota', null),
  ('e2d9e084-ec4e-46cf-8cc0-6ccf0d8df103', 'member-b@circletask.test', 'Citra Anggota', null),
  ('574c4254-5ef1-4efd-936a-4623b0e3f104', 'outsider@circletask.test', 'Raka Non Member', null)
on conflict (user_id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  updated_at = now();

insert into public.groups (id, name, description, join_code, owner_id)
values (
  '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201',
  'Kelompok Sistem Informasi',
  'Seed group untuk menguji alur task berbasis bukti kerja CircleTask.',
  'CTSEED01',
  '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101'
)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  join_code = excluded.join_code,
  updated_at = now();

insert into public.group_members (id, group_id, user_id, role)
values
  ('2fd4f2f6-790d-4811-8d1b-d62580f10211', '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201', '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101', 'leader'),
  ('97cc1cc1-57c8-44b4-8708-3cf44bb10212', '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201', 'b6f4c68c-c38b-4c09-9291-f5c0c716f102', 'member'),
  ('688c5ae9-6b21-486a-8fb8-a856c6f10213', '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201', 'e2d9e084-ec4e-46cf-8cc0-6ccf0d8df103', 'member')
on conflict (group_id, user_id) do update
set role = excluded.role;

insert into public.projects (id, group_id, title, description, deadline, status, created_by)
values (
  '5e46f6e5-3933-4ed9-bcdd-25f9392c0301',
  '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201',
  'MVP Presentasi Manajemen Proyek',
  'Project seed untuk alur create task, evidence, review, kontribusi, dan report.',
  now() + interval '14 days',
  'active',
  '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101'
)
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  deadline = excluded.deadline,
  status = excluded.status,
  updated_at = now();

insert into public.tasks (
  id,
  project_id,
  group_id,
  title,
  description,
  assigned_to,
  status,
  priority,
  weight,
  deadline,
  created_by,
  approved_by,
  approved_at
)
values
  (
    'cf9cc16d-39ce-42f6-9d88-2f2a4f2a0401',
    '5e46f6e5-3933-4ed9-bcdd-25f9392c0301',
    '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201',
    'Riset kebutuhan pengguna',
    'Kumpulkan pain point anggota kelompok dan bukti referensi.',
    'b6f4c68c-c38b-4c09-9291-f5c0c716f102',
    'approved',
    'high',
    30,
    now() - interval '1 day',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    now()
  ),
  (
    '8110e1bf-95f5-4711-8dc6-8eeb19d80402',
    '5e46f6e5-3933-4ed9-bcdd-25f9392c0301',
    '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201',
    'Buat wireframe dashboard',
    'Siapkan link Figma untuk dashboard kelompok dan task board.',
    'e2d9e084-ec4e-46cf-8cc0-6ccf0d8df103',
    'submit_review',
    'medium',
    25,
    now() + interval '3 days',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    null,
    null
  ),
  (
    '3668dbbc-48c5-4cdd-a6cf-7cf6377a0403',
    '5e46f6e5-3933-4ed9-bcdd-25f9392c0301',
    '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201',
    'Susun laporan kontribusi awal',
    'Draft bagian kontribusi dan pembagian bobot.',
    'b6f4c68c-c38b-4c09-9291-f5c0c716f102',
    'revision',
    'medium',
    20,
    now() + interval '5 days',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    null,
    null
  ),
  (
    'e87c7e7a-f64c-43bc-ae97-ced3babe0404',
    '5e46f6e5-3933-4ed9-bcdd-25f9392c0301',
    '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201',
    'Finalisasi slide presentasi',
    'Lengkapi slide ringkasan, demo flow, dan pembagian kerja.',
    'e2d9e084-ec4e-46cf-8cc0-6ccf0d8df103',
    'in_progress',
    'low',
    25,
    now() + interval '7 days',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    null,
    null
  )
on conflict (id) do update
set
  title = excluded.title,
  description = excluded.description,
  assigned_to = excluded.assigned_to,
  status = excluded.status,
  priority = excluded.priority,
  weight = excluded.weight,
  deadline = excluded.deadline,
  approved_by = excluded.approved_by,
  approved_at = excluded.approved_at,
  updated_at = now();

insert into public.task_evidences (
  id,
  task_id,
  uploaded_by,
  evidence_type,
  file_path,
  external_url,
  file_name,
  file_size,
  note
)
values
  (
    'c5d5a5c1-fd38-4fae-b356-3d2f0d2a0501',
    'cf9cc16d-39ce-42f6-9d88-2f2a4f2a0401',
    'b6f4c68c-c38b-4c09-9291-f5c0c716f102',
    'link',
    null,
    'https://github.com/example/circletask-research',
    null,
    null,
    'Repository riset dan catatan kebutuhan.'
  ),
  (
    'b2cbb98d-9e7b-4660-9f5c-d4b7a14d0502',
    '8110e1bf-95f5-4711-8dc6-8eeb19d80402',
    'e2d9e084-ec4e-46cf-8cc0-6ccf0d8df103',
    'link',
    null,
    'https://www.figma.com/file/circletask-seed',
    null,
    null,
    'Wireframe dashboard untuk review ketua.'
  ),
  (
    '646391c2-5d20-4a68-9b39-333f782a0503',
    '3668dbbc-48c5-4cdd-a6cf-7cf6377a0403',
    'b6f4c68c-c38b-4c09-9291-f5c0c716f102',
    'link',
    null,
    'https://drive.google.com/file/d/circletask-seed',
    null,
    null,
    'Draft laporan perlu revisi.'
  )
on conflict (id) do nothing;

insert into public.task_comments (id, task_id, user_id, comment)
values
  (
    'b911aa68-85e7-48de-ae2f-7e8d1ed80601',
    '8110e1bf-95f5-4711-8dc6-8eeb19d80402',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    'Tambahkan state kosong untuk task board.'
  ),
  (
    'f08e7f43-6292-4d8b-83bc-88ca6e990602',
    '3668dbbc-48c5-4cdd-a6cf-7cf6377a0403',
    'b6f4c68c-c38b-4c09-9291-f5c0c716f102',
    'Revisi sedang dikerjakan sesuai catatan ketua.'
  )
on conflict (id) do nothing;

insert into public.task_reviews (id, task_id, reviewed_by, review_status, review_note)
values
  (
    'eef4f4df-8791-4db6-b12e-8820948b0701',
    'cf9cc16d-39ce-42f6-9d88-2f2a4f2a0401',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    'approved',
    null
  ),
  (
    'f2e312d2-e17c-459b-83ff-eae2fe1b0702',
    '3668dbbc-48c5-4cdd-a6cf-7cf6377a0403',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    'revision',
    'Tambahkan sumber data dan pembagian bobot yang lebih jelas.'
  )
on conflict (id) do nothing;

insert into public.activity_logs (id, group_id, project_id, task_id, user_id, action, description, metadata)
values
  (
    '79b54fbe-8c90-43d2-b1ff-50af09b10801',
    '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201',
    null,
    null,
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    'group.created',
    'Kelompok seed dibuat',
    '{"join_code":"CTSEED01"}'::jsonb
  ),
  (
    'a9249aa8-e8bd-48ea-ae91-6f1cf8870802',
    '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201',
    '5e46f6e5-3933-4ed9-bcdd-25f9392c0301',
    '8110e1bf-95f5-4711-8dc6-8eeb19d80402',
    'e2d9e084-ec4e-46cf-8cc0-6ccf0d8df103',
    'task.review_submitted',
    'Task dikirim untuk review',
    '{"status":"submit_review"}'::jsonb
  ),
  (
    'e07a9f15-6a92-4906-a37d-3f8f09f70803',
    '7c9cb6d2-bb21-4bb9-a812-7e6b9d4a0201',
    '5e46f6e5-3933-4ed9-bcdd-25f9392c0301',
    '3668dbbc-48c5-4cdd-a6cf-7cf6377a0403',
    '9b7d0fa1-8e47-4e83-8c79-2edb2a58f101',
    'task.revision_requested',
    'Ketua meminta revisi task',
    '{"review_id":"f2e312d2-e17c-459b-83ff-eae2fe1b0702"}'::jsonb
  )
on conflict (id) do nothing;

