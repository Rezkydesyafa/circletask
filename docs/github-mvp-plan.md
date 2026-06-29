# GitHub MVP Plan - CircleTask

Dokumen ini adalah script kerja untuk membuat GitHub Issues dan GitHub Project yang realistis untuk MVP CircleTask. Scope mengikuti `docs/PRD.md`, `docs/app-flow.md`, `docs/technical-spec.md`, dan `docs/backlog.md`.

## Tujuan

Membagi MVP CircleTask menjadi issue yang cukup kecil untuk dikerjakan, tetapi tetap merepresentasikan alur produk end-to-end:

```text
Auth -> Group -> Project -> Task -> Evidence -> Review -> Contribution -> PDF Report -> Deploy
```

Jangan membuat issue untuk fitur di luar MVP:

- Role dosen.
- Payment.
- Chat realtime penuh.
- WhatsApp integration.
- AI summary.
- Mobile app native.

## GitHub Project Setup

Nama project:

```text
CircleTask MVP
```

Tipe project:

```text
Repository project atau organization/user project v2
```

Recommended views:

| View | Grouping | Tujuan |
| --- | --- | --- |
| Board by Status | Status | Melihat pekerjaan dari Backlog sampai Done. |
| Table by Sprint | Milestone | Melihat scope per sprint. |
| Roadmap | Milestone | Melihat urutan delivery MVP. |
| Area View | Label `area:*` | Melihat beban kerja per domain fitur. |

Recommended status columns:

- Backlog
- Ready
- In Progress
- In Review
- Blocked
- Done

Recommended custom fields:

| Field | Type | Values |
| --- | --- | --- |
| Priority | Single select | High, Medium, Low |
| Sprint | Single select | Sprint 1, Sprint 2, Sprint 3, Sprint 4, Sprint 5 |
| Area | Single select | app, auth, supabase, groups, projects, tasks, evidences, reviews, activity, contributions, reports, release |
| Size | Single select | S, M, L |

Jika ingin sederhana, cukup gunakan labels dan milestones dari script.

## Labels

Script `scripts/create-github-mvp-issues.ps1` akan membuat labels berikut:

- `priority:high`
- `priority:medium`
- `type:setup`
- `type:feature`
- `type:security`
- `type:ui`
- `type:database`
- `type:testing`
- `type:deployment`
- `area:app`
- `area:auth`
- `area:supabase`
- `area:groups`
- `area:projects`
- `area:tasks`
- `area:evidences`
- `area:reviews`
- `area:comments`
- `area:activity`
- `area:contributions`
- `area:reports`
- `area:release`
- `sprint:1` sampai `sprint:5`

## Milestones

| Milestone | Goal |
| --- | --- |
| Sprint 1 - Foundation | Project bisa jalan, auth dasar siap, schema/RLS awal jelas, dashboard shell tersedia. |
| Sprint 2 - Groups and Projects | User bisa membuat/join kelompok dan ketua bisa membuat project. |
| Sprint 3 - Task Management | Ketua bisa membuat task dan anggota bisa mengerjakan task sampai status in progress. |
| Sprint 4 - Evidence and Review | Anggota bisa upload bukti, submit review, ketua bisa approve/revision/reassign, activity log berjalan. |
| Sprint 5 - Contribution Report and Release | Kontribusi dihitung, report PDF bisa diexport, MVP dites dan deploy. |

## Issue List Realistis

### Sprint 1 - Foundation

1. Setup Next.js App Router, TypeScript, Tailwind, and project config.
2. Setup shadcn/ui theme, base layout, and reusable UI primitives.
3. Setup Supabase clients, env contract, and database migration baseline.
4. Implement Supabase Auth register, login, logout, and profile bootstrap.
5. Implement protected dashboard shell and route guard.
6. Implement base database schema, RLS helpers, and storage bucket plan.

### Sprint 2 - Groups and Projects

7. Implement create group flow with join code and leader membership.
8. Implement join group flow and membership validation.
9. Implement groups list, group dashboard, and members page.
10. Implement create/list/detail project flow with project progress summary.

### Sprint 3 - Task Management

11. Implement create task flow with assignment, priority, deadline, and weight.
12. Implement task board and task cards by status.
13. Implement task detail and safe status transitions for assigned members.
14. Implement task comments.
15. Implement task permission checks and server action guard coverage.

### Sprint 4 - Evidence and Review

16. Implement evidence upload and external evidence link support.
17. Implement submit review flow with evidence requirement.
18. Implement leader review page with approve and revision actions.
19. Implement task reassign flow with required reason.
20. Implement activity log creation and activity timeline page.

### Sprint 5 - Contribution Report and Release

21. Implement contribution scoring calculation.
22. Implement contribution page and dashboard progress metrics.
23. Implement report preview data aggregation.
24. Implement React PDF contribution report export.
25. Final testing, security review, and Vercel deployment.

## Cara Menjalankan Script

Prasyarat:

- GitHub CLI (`gh`) sudah terinstall.
- Sudah login dengan `gh auth login`.
- Repository GitHub sudah ada.

Contoh membuat labels, milestones, dan issues:

```powershell
.\scripts\create-github-mvp-issues.ps1 -Repo "OWNER/REPO"
```

Contoh dry run:

```powershell
.\scripts\create-github-mvp-issues.ps1 -Repo "OWNER/REPO" -DryRun
```

Contoh menambahkan issue yang dibuat ke GitHub Project v2:

```powershell
.\scripts\create-github-mvp-issues.ps1 -Repo "OWNER/REPO" -ProjectOwner "OWNER" -ProjectNumber 1
```

Catatan:

- `ProjectNumber` adalah nomor GitHub Project v2, bukan nomor issue.
- Script menambahkan issue ke Project jika `ProjectOwner` dan `ProjectNumber` diberikan.
- Status column di Project tetap diatur manual atau dengan workflow GitHub Project.
- Untuk menghindari issue duplikat, jalankan script sekali untuk repo yang sama.

## Definition of Done MVP

MVP dianggap selesai jika:

- User bisa register, login, logout, dan membuka protected dashboard.
- User bisa membuat dan join kelompok.
- Ketua bisa membuat project dan task.
- Anggota bisa update task menjadi `in_progress`.
- Anggota bisa upload bukti dan submit review.
- Anggota tidak bisa langsung membuat task `done`.
- Ketua bisa approve, revision, dan reassign task.
- Activity log tercatat untuk aksi penting.
- Kontribusi hanya dihitung dari task `approved` atau `done`.
- Ketua bisa preview dan export laporan kontribusi PDF.
- RLS mencegah user luar kelompok melihat data kelompok, task, komentar, activity log, dan bukti.
- Aplikasi berhasil deploy ke Vercel dan terhubung ke Supabase.
