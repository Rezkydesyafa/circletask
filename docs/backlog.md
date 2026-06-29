# Backlog - CircleTask

Backlog ini disusun berdasarkan sprint MVP dari PRD. Status awal semua item adalah `Todo`.

## Sprint 1 - Setup Dasar

| Epic | User story | Task teknis | Priority | Status |
| --- | --- | --- | --- | --- |
| Setup Project | Sebagai developer, saya ingin project Next.js siap dikembangkan agar fitur bisa dibangun terstruktur. | Setup Next.js App Router, TypeScript, Tailwind CSS, import alias `@/`, struktur folder awal. | High | Todo |
| UI Foundation | Sebagai developer, saya ingin komponen dasar UI siap agar tampilan konsisten dengan desain Stitch. | Setup shadcn/ui, theme, `globals.css`, layout root, komponen common awal. | High | Todo |
| Supabase | Sebagai developer, saya ingin Supabase terhubung agar auth, database, dan storage bisa digunakan. | Setup Supabase client/server, environment variables, `.env.example`, connection check. | High | Todo |
| Auth | Sebagai user, saya ingin register dan login agar dapat mengakses dashboard. | Implement register, login, logout, session handling, profile insert awal. | High | Todo |
| Protected Route | Sebagai user login, saya ingin dashboard hanya bisa diakses setelah login agar data aman. | Middleware/protected layout, redirect guest ke login, redirect auth user ke dashboard. | High | Todo |
| Dashboard Layout | Sebagai user, saya ingin layout dashboard rapi agar mudah navigasi. | Implement dashboard shell, sidebar, header, mobile nav, loading state. | Medium | Todo |

## Sprint 2 - Kelompok dan Project

| Epic | User story | Task teknis | Priority | Status |
| --- | --- | --- | --- | --- |
| Kelompok | Sebagai ketua, saya ingin membuat kelompok agar dapat mengelola tugas kelompok. | Form create group, generate join code, insert `groups`, insert leader membership, activity log. | High | Todo |
| Kelompok | Sebagai anggota, saya ingin join kelompok dengan kode agar bisa masuk ke ruang kerja kelompok. | Form join group, validasi join code, insert `group_members`, prevent duplicate membership. | High | Todo |
| Kelompok | Sebagai user, saya ingin melihat daftar kelompok agar bisa memilih ruang kerja. | Query daftar kelompok berdasarkan membership, `GroupCard`, empty state. | High | Todo |
| Kelompok | Sebagai anggota kelompok, saya ingin melihat detail kelompok agar tahu progress dan konteks kelompok. | Group dashboard query, stats ringkas, deadline terdekat, role-based actions. | High | Todo |
| Anggota | Sebagai ketua, saya ingin melihat daftar anggota agar bisa assign task dengan benar. | Members page, query `group_members`, role badge, optional remove member action sesuai MVP. | Medium | Todo |
| Project | Sebagai ketua, saya ingin membuat project agar task bisa dikelompokkan. | Form create project, validasi Zod, insert `projects`, activity log. | High | Todo |
| Project | Sebagai anggota kelompok, saya ingin melihat detail project agar paham progres task. | Project detail, project stats, daftar task ringkas, progress calculation. | High | Todo |

## Sprint 3 - Task Management

| Epic | User story | Task teknis | Priority | Status |
| --- | --- | --- | --- | --- |
| Task | Sebagai ketua, saya ingin membuat task agar pekerjaan terbagi jelas. | Form create task, assign member, deadline, priority, weight, default status `todo`. | High | Todo |
| Task | Sebagai ketua, saya ingin assign task ke anggota agar tanggung jawab jelas. | Validasi assigned user adalah member group, activity log task assigned. | High | Todo |
| Task Board | Sebagai anggota kelompok, saya ingin melihat task board agar progres mudah dipantau. | Task board per status, `TaskCard`, status badge, priority badge, overdue label. | High | Todo |
| Task Detail | Sebagai user kelompok, saya ingin melihat detail task agar tahu instruksi dan riwayatnya. | Task detail query, role-based actions, evidence section, comments section. | High | Todo |
| Status Task | Sebagai anggota, saya ingin update status task menjadi in progress agar progres tercatat. | Server action update status, larang anggota set `done`, activity log status changed. | High | Todo |
| Komentar | Sebagai anggota kelompok, saya ingin komentar pada task agar diskusi dan revisi terdokumentasi. | Create comment action, list comments kronologis, RLS membership, activity log. | Medium | Todo |

## Sprint 4 - Bukti dan Review

| Epic | User story | Task teknis | Priority | Status |
| --- | --- | --- | --- | --- |
| Bukti Kerja | Sebagai anggota, saya ingin upload bukti pekerjaan agar progres dapat divalidasi. | Supabase Storage upload, path `group-id/project-id/task-id/filename`, metadata `task_evidences`. | High | Todo |
| Bukti Kerja | Sebagai user kelompok, saya ingin melihat daftar bukti agar hasil kerja transparan. | `EvidenceList`, signed URL/private access, external link validation. | High | Todo |
| Review | Sebagai anggota, saya ingin submit review setelah upload bukti agar task bisa divalidasi. | Submit review action, cek minimal satu bukti, status `submit_review`, activity log. | High | Todo |
| Review | Sebagai ketua, saya ingin halaman review task agar validasi task lebih cepat. | Review task list, filter `submit_review`, buka detail bukti. | High | Todo |
| Review | Sebagai ketua, saya ingin approve task agar kontribusi anggota dihitung. | Approve action, insert `task_reviews`, update approved fields/status, activity log. | High | Todo |
| Review | Sebagai ketua, saya ingin meminta revisi agar anggota memperbaiki hasil kerja. | Revision form, wajib note, insert `task_reviews`, status `revision`, activity log. | High | Todo |
| Reassign | Sebagai ketua, saya ingin reassign task agar task anggota tidak aktif bisa dipindahkan. | Reassign action, wajib reason, insert `task_reassignments`, update `assigned_to`, activity log. | High | Todo |
| Activity Log | Sebagai anggota kelompok, saya ingin melihat activity log agar perubahan task transparan. | Activity page, timeline component, query berdasarkan membership group. | Medium | Todo |

## Sprint 5 - Kontribusi dan Laporan

| Epic | User story | Task teknis | Priority | Status |
| --- | --- | --- | --- | --- |
| Kontribusi | Sebagai ketua, saya ingin melihat skor kontribusi agar pembagian kerja terlihat objektif. | Query task `approved`/`done`, hitung skor weight, penalti deadline/revisi, contribution table. | High | Todo |
| Kontribusi | Sebagai anggota, saya ingin melihat kontribusi sendiri agar tahu posisi saya dalam kelompok. | Member contribution summary, detail sumber poin, empty state jika belum ada approved task. | Medium | Todo |
| Dashboard | Sebagai anggota kelompok, saya ingin dashboard progress agar status kelompok mudah dipahami. | Dashboard stats total project/task, done, overdue, pending review, deadline terdekat. | High | Todo |
| Report | Sebagai ketua, saya ingin preview laporan agar bisa memeriksa data sebelum export. | Report preview page, data group/project/member/task/evidence/reassign/activity/contribution. | High | Todo |
| PDF Export | Sebagai ketua, saya ingin export laporan PDF agar bisa dilampirkan saat pengumpulan tugas. | `ContributionReportPDF` dengan React PDF, download action, activity log export. | High | Todo |
| Testing | Sebagai developer, saya ingin fitur MVP teruji agar alur utama tidak regresi. | Test validasi, permissions, server actions, contribution calculation, manual QA route utama. | High | Todo |
| Deployment | Sebagai owner, saya ingin deploy ke Vercel agar aplikasi dapat digunakan. | Setup env Vercel, Supabase production config, deploy, smoke test. | High | Todo |
