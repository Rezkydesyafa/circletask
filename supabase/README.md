# Supabase Setup - CircleTask

This folder contains the Supabase baseline for the CircleTask MVP.

## Files

- `migrations/202606300001_baseline.sql` - core schema, enum types, indexes, helper functions, triggers, and initial RLS policies.
- `storage/task-evidences.sql` - private `task-evidences` bucket and storage object policies.
- `seed.sql` - intentionally empty for MVP setup.

## Environment

Copy `.env.example` to `.env.local` and fill these values:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
```

Rules:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe for browser clients.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be imported by client components.
- Do not prefix server-only secrets with `NEXT_PUBLIC_`.
- All application data access must assume RLS is enabled.

## Local Setup

Use the Supabase CLI if you run Supabase locally:

```powershell
supabase start
supabase db reset
```

If you apply SQL manually in hosted Supabase:

1. Run `supabase/migrations/202606300001_baseline.sql` in the SQL editor.
2. Run `supabase/storage/task-evidences.sql` in the SQL editor.
3. Confirm RLS is enabled on all public tables.
4. Confirm the `task-evidences` bucket is private.

## Notes

- The migration only creates the MVP database baseline. It does not add sample business data.
- Storage paths must follow `group-id/project-id/task-id/filename`.
- File evidence is limited to PDF, PNG, JPG, and DOCX with a 5 MB limit.
- External evidence links are stored in `task_evidences.external_url`, not in Storage.
