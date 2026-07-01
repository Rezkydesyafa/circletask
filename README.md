# CircleTask

CircleTask adalah aplikasi manajemen tugas kelompok berbasis bukti kerja. Project ini mengikuti PRD di `docs/PRD.md` dan desain Google Stitch sebagai acuan visual utama.

## Dokumen Utama

- `docs/PRD.md` - source of truth scope MVP, role, fitur, business rules, database, RLS, storage, dan alur aplikasi.
- `docs/project-context.md` - ringkasan project untuk AI agent.
- `docs/app-flow.md` - user flow dan route aplikasi.
- `docs/technical-spec.md` - schema, RLS, storage, validasi, dan aturan teknis.
- `docs/ui-and-agent-guidelines.md` - UI, component map, coding rules, dan agent rules.
- `docs/backlog.md` - backlog per sprint.
- `docs/github-mvp-plan.md` - rencana GitHub Project, milestones, labels, dan daftar issue MVP.
- `supabase/README.md` - catatan setup Supabase, migration baseline, storage bucket, dan aturan env.

## GitHub Issue dan Project

Repository GitHub:

```text
https://github.com/Rezkydesyafa/circletask
```

Gunakan wrapper berikut setelah GitHub CLI sudah login:

```powershell
.\scripts\setup-github-issues.ps1
```

Untuk melihat perintah tanpa membuat issue:

```powershell
.\scripts\setup-github-issues.ps1 -DryRun
```

Jika ingin menjalankan script utama secara eksplisit:

```powershell
.\scripts\create-github-mvp-issues.ps1 -Repo "Rezkydesyafa/circletask"
```

Jika ingin menambahkan issue ke GitHub Project v2:

```powershell
.\scripts\setup-github-issues.ps1 -ProjectOwner "Rezkydesyafa" -ProjectNumber 1
```

## Development Setup

Install dependency:

```powershell
pnpm install
```

Jalankan development server:

```powershell
pnpm dev
```

Validasi setup:

```powershell
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm test:supabase
pnpm build
```

Environment minimal:

```powershell
Copy-Item .env.example .env.local
```

Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sebelum mengaktifkan auth dan akses data Supabase.
Lihat `supabase/README.md` untuk urutan menjalankan migration dan storage policy.
`pnpm test:supabase` akan skip otomatis jika env integrasi Supabase belum lengkap.

## Struktur Folder Rekomendasi

```text
circletask/
|-- app/
|   |-- (public)/
|   |-- (auth)/
|   |-- (dashboard)/
|   |-- api/
|   |-- layout.tsx
|   `-- globals.css
|-- components/
|   |-- ui/
|   |-- layout/
|   |-- common/
|   `-- pdf/
|-- features/
|   |-- auth/
|   |-- profile/
|   |-- groups/
|   |-- projects/
|   |-- tasks/
|   |-- evidences/
|   |-- reviews/
|   |-- comments/
|   |-- activity-logs/
|   |-- contributions/
|   `-- reports/
|-- lib/
|   |-- supabase/
|   |-- validations/
|   |-- permissions.ts
|   |-- utils.ts
|   |-- upload.ts
|   `-- date.ts
|-- hooks/
|-- types/
|-- supabase/
|   |-- migrations/
|   |-- policies/
|   |-- storage/
|   `-- seed.sql
|-- public/
|   |-- images/
|   `-- design-reference/
|-- docs/
|-- middleware.ts
|-- .env.example
`-- README.md
```

## Fungsi Folder

| Folder/file | Fungsi |
| --- | --- |
| `app/` | Route Next.js App Router, layout, route group public/auth/dashboard, dan API route bila diperlukan. |
| `app/(public)/` | Route publik seperti landing page. |
| `app/(auth)/` | Route login dan register. |
| `app/(dashboard)/` | Protected routes seperti dashboard, groups, projects, tasks, review, contribution, activity, report, dan profile. |
| `app/api/` | API route khusus jika tidak cukup memakai Server Actions. |
| `components/ui/` | Komponen shadcn/ui hasil generate. |
| `components/layout/` | Komponen layout seperti `AppSidebar`, `DashboardHeader`, dan `MobileNav`. |
| `components/common/` | Komponen reusable lintas fitur seperti badge, empty state, loading state, dialog, avatar, dan stat card. |
| `components/pdf/` | Komponen React PDF seperti `ContributionReportPDF`. |
| `features/auth/` | Logic auth, form login/register, schemas, actions, dan queries terkait auth. |
| `features/profile/` | Logic profil user dan form edit profil. |
| `features/groups/` | Logic kelompok, join code, members, dan dashboard kelompok. |
| `features/projects/` | Logic project, daftar project, detail project, dan progress project. |
| `features/tasks/` | Logic task, task board, task detail, status task, priority, deadline, dan assignment. |
| `features/evidences/` | Logic upload bukti, list bukti, dan validasi file/link. |
| `features/reviews/` | Logic submit review, approve, revision, dan review task list. |
| `features/comments/` | Logic komentar task. |
| `features/activity-logs/` | Logic pencatatan dan tampilan activity log. |
| `features/contributions/` | Logic perhitungan kontribusi dan tabel kontribusi. |
| `features/reports/` | Logic report preview dan export PDF. |
| `lib/supabase/` | Supabase client untuk server/browser, session helper, dan auth utilities. |
| `lib/validations/` | Shared Zod schemas jika dipakai lintas fitur. |
| `lib/permissions.ts` | Helper permission server-side untuk cek leader/member. |
| `lib/utils.ts` | Utility umum non-domain. |
| `lib/upload.ts` | Helper upload dan validasi file bukti. |
| `lib/date.ts` | Helper format tanggal, deadline, overdue, dan penalti deadline. |
| `hooks/` | Custom React hooks untuk interaksi client-side. |
| `types/` | Shared TypeScript types lintas fitur. |
| `supabase/migrations/` | SQL migration database. |
| `supabase/policies/` | SQL policy RLS. |
| `supabase/storage/` | SQL atau catatan setup bucket/policy storage. |
| `public/images/` | Asset gambar aplikasi. |
| `public/design-reference/` | Export atau screenshot desain Google Stitch sebagai referensi visual lokal. |
| `docs/` | Dokumentasi minimal untuk manusia dan AI agent. |
| `middleware.ts` | Guard protected route dan session refresh saat auth sudah diimplementasikan. |
| `.env.example` | Template environment variable yang aman untuk dibagikan. |

## Prinsip Implementasi

- Baca `docs/PRD.md` sebelum membuat fitur.
- Ikuti desain Google Stitch untuk UI.
- Tetap pada scope MVP.
- Jangan menambahkan role dosen, payment, chat realtime penuh, WhatsApp integration, atau AI summary.
- Amankan akses data dengan Supabase RLS.
- Jangan gunakan service role key di client.
- Buat activity log untuk aksi penting.
