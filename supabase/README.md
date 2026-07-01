# Supabase Setup - CircleTask

This folder contains the Supabase baseline for the CircleTask MVP.

## Files

- `migrations/202606300001_baseline.sql` - core schema, enum types, indexes, helper functions, triggers, and initial RLS policies.
- `migrations/202606300002_task_evidence_storage.sql` - private `task-evidences` bucket and storage object policies for `supabase db push/reset`.
- `migrations/202606300003_evidence_mutation_policies.sql` - idempotent policies for evidence delete/replace actions.
- `storage/task-evidences.sql` - standalone storage SQL if applying setup manually.
- `seed.sql` - realistic local MVP seed for auth users, group, members, project, tasks, evidences, reviews, comments, and activity logs.
- `../types/supabase.ts` - baseline database type contract. Regenerate from Supabase CLI after migrations are applied.

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
pnpm supabase:migrate:local
```

Generate database types from local Supabase:

```powershell
pnpm supabase:types
```

Run the integration smoke test after `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`:

```powershell
pnpm test:supabase
```

If those environment variables are not present, the smoke test compiles and skips.

If you apply SQL manually in hosted Supabase:

1. Run `supabase/migrations/202606300001_baseline.sql` in the SQL editor.
2. Run `supabase/migrations/202606300002_task_evidence_storage.sql` in the SQL editor.
3. Run `supabase/migrations/202606300003_evidence_mutation_policies.sql` in the SQL editor if the baseline was applied before evidence delete/replace support.
4. Confirm RLS is enabled on all public tables.
5. Confirm the `task-evidences` bucket is private.
6. Run `.\scripts\generate-supabase-types.ps1 -ProjectId <project-ref>` to refresh generated types.

For linked hosted projects with Supabase CLI:

```powershell
supabase link --project-ref <project-ref>
pnpm supabase:migrate
.\scripts\generate-supabase-types.ps1 -ProjectId <project-ref>
```

## Notes

- The seed is for local/testing only. Do not run seeded test accounts in production.
- Storage paths must follow `group-id/project-id/task-id/filename`.
- File evidence is limited to PDF, PNG, JPG, and DOCX with a 5 MB limit.
- External evidence links are stored in `task_evidences.external_url`, not in Storage.
- Evidence file cleanup is handled by server actions when metadata insert/update fails.
- Evidence delete/replace actions require either the uploader or the group leader, backed by RLS and Storage policies.
