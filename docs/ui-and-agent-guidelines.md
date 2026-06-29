# UI dan Agent Guidelines - CircleTask

Dokumen ini menggabungkan UI guidelines, screen mapping, component map, coding guidelines, dan instruksi AI agent.

## UI Guidelines

- Ikuti desain Google Stitch sebagai acuan visual utama untuk layout, warna, spacing, komponen, dan tampilan halaman.
- Jangan membuat style baru dari nol jika desain Stitch sudah memberi pola.
- Gunakan clean minimal SaaS dashboard.
- UI harus friendly untuk mahasiswa.
- Gunakan rounded cards.
- Gunakan spacing yang lega.
- Gunakan status badge yang jelas.
- Gunakan empty state yang membantu.
- Gunakan loading state untuk fetch data, submit form, upload, dan export PDF.
- Gunakan layout responsive untuk mobile dan desktop.
- Bedakan UI Ketua dan Anggota berdasarkan aksi yang tersedia, bukan role baru.
- Jangan tampilkan aksi ketua ke anggota jika anggota tidak punya hak melakukan aksi tersebut.
- Jangan jadikan kontrol frontend sebagai satu-satunya keamanan; akses tetap diamankan dengan server validation dan RLS.

## Screen to Route Mapping

| Screen | Route |
| --- | --- |
| Landing page | `/` |
| Login page | `/login` |
| Register page | `/register` |
| Main dashboard | `/dashboard` |
| Group dashboard leader | `/groups/[groupId]` |
| Group dashboard member | `/groups/[groupId]` |
| Project detail | `/groups/[groupId]/projects/[projectId]` |
| Task board | `/groups/[groupId]/projects/[projectId]/tasks` |
| Task detail | `/groups/[groupId]/projects/[projectId]/tasks/[taskId]` |
| Review task | `/groups/[groupId]/review` |
| Contribution page | `/groups/[groupId]/contribution` |
| Activity log | `/groups/[groupId]/activity` |
| Report preview | `/groups/[groupId]/report` |
| Profile | `/profile` |

## Component Map

Layout dan navigasi:

- `AppSidebar`
- `DashboardHeader`
- `MobileNav`
- `PageHeader`

Common components:

- `StatusBadge`
- `PriorityBadge`
- `DeadlineBadge`
- `EmptyState`
- `LoadingState`
- `ConfirmDialog`
- `UserAvatar`
- `StatCard`

Domain components:

- `GroupCard`
- `ProjectCard`
- `TaskBoard`
- `TaskCard`
- `TaskDetail`
- `EvidenceUploadForm`
- `EvidenceList`
- `ReviewTaskList`
- `RevisionForm`
- `ContributionTable`
- `ActivityTimeline`
- `ReportPreview`
- `ContributionReportPDF`

## Coding Guidelines

- Gunakan Next.js App Router.
- Gunakan TypeScript.
- Gunakan feature-based folder structure.
- Gunakan Server Components jika memungkinkan.
- Gunakan Client Components hanya untuk interaksi seperti form, upload, modal, tabs, dan drag/drop.
- Gunakan Server Actions untuk mutation database.
- Gunakan Zod untuk validasi.
- Gunakan React Hook Form untuk form.
- Gunakan shadcn/ui untuk komponen UI.
- Jangan menaruh logic bisnis besar di `page.tsx`.
- `page.tsx` hanya untuk routing, fetch awal, dan render komponen utama.
- Pisahkan `queries.ts`, `actions.ts`, `schemas.ts`, `types.ts`, dan `components/` per fitur.
- Jangan expose Supabase service role key ke client.
- Semua akses data tetap diamankan dengan RLS.
- Buat activity log untuk aksi penting.
- Gunakan nama file lowercase-kebab-case.
- Gunakan import alias `@/`.

## Feature Folder Pattern

Pola folder per fitur:

```text
features/tasks/
|-- actions.ts
|-- queries.ts
|-- schemas.ts
|-- types.ts
`-- components/
```

Gunakan pola ini hanya saat fitur mulai dikerjakan. Jangan membuat logic palsu hanya untuk mengisi folder.

## AI Agent Rules

- Selalu baca `docs/PRD.md` terlebih dahulu.
- Selalu ikuti desain Google Stitch untuk UI.
- Ikuti scope MVP.
- Jangan membuat fitur di luar MVP kecuali diminta.
- Jangan menambahkan role dosen.
- Jangan menambahkan payment.
- Jangan menambahkan chat realtime penuh.
- Jangan menambahkan WhatsApp integration.
- Jangan menambahkan AI summary untuk MVP.
- Pastikan anggota tidak bisa langsung membuat task `done`.
- Pastikan task tidak bisa `submit_review` tanpa bukti.
- Pastikan kontribusi hanya dihitung dari task `approved` atau `done`.
- Pastikan setiap aksi penting membuat activity log.
- Pastikan user luar kelompok tidak bisa melihat data kelompok, task, komentar, activity log, atau bukti pekerjaan.
- Jika ada konflik antara asumsi implementasi dan PRD, ikuti PRD dan catat keputusan teknisnya.
