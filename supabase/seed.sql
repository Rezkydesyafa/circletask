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
    '00000000-0000-0000-0000-000000000101',
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
    '00000000-0000-0000-0000-000000000102',
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
    '00000000-0000-0000-0000-000000000103',
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
    '00000000-0000-0000-0000-000000000104',
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
        ('00000000-0000-0000-0000-000000000101'::uuid, 'leader@circletask.test'),
        ('00000000-0000-0000-0000-000000000102'::uuid, 'member-a@circletask.test'),
        ('00000000-0000-0000-0000-000000000103'::uuid, 'member-b@circletask.test'),
        ('00000000-0000-0000-0000-000000000104'::uuid, 'outsider@circletask.test')
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
  ('00000000-0000-0000-0000-000000000101', 'leader@circletask.test', 'Nadia Ketua', null),
  ('00000000-0000-0000-0000-000000000102', 'member-a@circletask.test', 'Bima Anggota', null),
  ('00000000-0000-0000-0000-000000000103', 'member-b@circletask.test', 'Citra Anggota', null),
  ('00000000-0000-0000-0000-000000000104', 'outsider@circletask.test', 'Raka Non Member', null)
on conflict (user_id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  updated_at = now();

insert into public.groups (id, name, description, join_code, owner_id)
values (
  '00000000-0000-0000-0000-000000000201',
  'Kelompok Sistem Informasi',
  'Seed group untuk menguji alur task berbasis bukti kerja CircleTask.',
  'CTSEED01',
  '00000000-0000-0000-0000-000000000101'
)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  join_code = excluded.join_code,
  updated_at = now();

insert into public.group_members (id, group_id, user_id, role)
values
  ('00000000-0000-0000-0000-000000000211', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'leader'),
  ('00000000-0000-0000-0000-000000000212', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000102', 'member'),
  ('00000000-0000-0000-0000-000000000213', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000103', 'member')
on conflict (group_id, user_id) do update
set role = excluded.role;

insert into public.projects (id, group_id, title, description, deadline, status, created_by)
values (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000201',
  'MVP Presentasi Manajemen Proyek',
  'Project seed untuk alur create task, evidence, review, kontribusi, dan report.',
  now() + interval '14 days',
  'active',
  '00000000-0000-0000-0000-000000000101'
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
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000201',
    'Riset kebutuhan pengguna',
    'Kumpulkan pain point anggota kelompok dan bukti referensi.',
    '00000000-0000-0000-0000-000000000102',
    'approved',
    'high',
    30,
    now() - interval '1 day',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000101',
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000201',
    'Buat wireframe dashboard',
    'Siapkan link Figma untuk dashboard kelompok dan task board.',
    '00000000-0000-0000-0000-000000000103',
    'submit_review',
    'medium',
    25,
    now() + interval '3 days',
    '00000000-0000-0000-0000-000000000101',
    null,
    null
  ),
  (
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000201',
    'Susun laporan kontribusi awal',
    'Draft bagian kontribusi dan pembagian bobot.',
    '00000000-0000-0000-0000-000000000102',
    'revision',
    'medium',
    20,
    now() + interval '5 days',
    '00000000-0000-0000-0000-000000000101',
    null,
    null
  ),
  (
    '00000000-0000-0000-0000-000000000404',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000201',
    'Finalisasi slide presentasi',
    'Lengkapi slide ringkasan, demo flow, dan pembagian kerja.',
    '00000000-0000-0000-0000-000000000103',
    'in_progress',
    'low',
    25,
    now() + interval '7 days',
    '00000000-0000-0000-0000-000000000101',
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
    '00000000-0000-0000-0000-000000000501',
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000102',
    'link',
    null,
    'https://github.com/example/circletask-research',
    null,
    null,
    'Repository riset dan catatan kebutuhan.'
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000103',
    'link',
    null,
    'https://www.figma.com/file/circletask-seed',
    null,
    null,
    'Wireframe dashboard untuk review ketua.'
  ),
  (
    '00000000-0000-0000-0000-000000000503',
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000102',
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
    '00000000-0000-0000-0000-000000000601',
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000101',
    'Tambahkan state kosong untuk task board.'
  ),
  (
    '00000000-0000-0000-0000-000000000602',
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000102',
    'Revisi sedang dikerjakan sesuai catatan ketua.'
  )
on conflict (id) do nothing;

insert into public.task_reviews (id, task_id, reviewed_by, review_status, review_note)
values
  (
    '00000000-0000-0000-0000-000000000701',
    '00000000-0000-0000-0000-000000000401',
    '00000000-0000-0000-0000-000000000101',
    'approved',
    null
  ),
  (
    '00000000-0000-0000-0000-000000000702',
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000101',
    'revision',
    'Tambahkan sumber data dan pembagian bobot yang lebih jelas.'
  )
on conflict (id) do nothing;

insert into public.activity_logs (id, group_id, project_id, task_id, user_id, action, description, metadata)
values
  (
    '00000000-0000-0000-0000-000000000801',
    '00000000-0000-0000-0000-000000000201',
    null,
    null,
    '00000000-0000-0000-0000-000000000101',
    'group.created',
    'Kelompok seed dibuat',
    '{"join_code":"CTSEED01"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000802',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000402',
    '00000000-0000-0000-0000-000000000103',
    'task.review_submitted',
    'Task dikirim untuk review',
    '{"status":"submit_review"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000803',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000403',
    '00000000-0000-0000-0000-000000000101',
    'task.revision_requested',
    'Ketua meminta revisi task',
    '{"review_id":"00000000-0000-0000-0000-000000000702"}'::jsonb
  )
on conflict (id) do nothing;
