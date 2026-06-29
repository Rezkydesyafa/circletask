# Technical Spec - CircleTask

Dokumen ini menggabungkan database schema, RLS, storage, validasi, dan aturan teknis MVP. `docs/PRD.md` tetap menjadi source of truth utama.

## Enum

Task status:

- `todo`
- `in_progress`
- `submit_review`
- `revision`
- `approved`
- `done`

Priority:

- `low`
- `medium`
- `high`

Group role:

- `leader`
- `member`

Review status:

- `approved`
- `revision`
- `rejected`

## Database Schema

### `profiles`

Fungsi: menyimpan data tambahan user dari Supabase Auth.

Kolom utama:

- `id`
- `user_id`
- `full_name`
- `avatar_url`
- `created_at`
- `updated_at`

Relasi penting:

- `user_id` mengarah ke user Supabase Auth.
- Dipakai oleh `group_members`, `groups.owner_id`, `projects.created_by`, `tasks.assigned_to`, dan activity.

### `groups`

Fungsi: menyimpan data kelompok.

Kolom utama:

- `id`
- `name`
- `description`
- `join_code`
- `owner_id`
- `created_at`
- `updated_at`

Relasi penting:

- `owner_id` adalah ketua pembuat kelompok.
- Satu group punya banyak `group_members`, `projects`, `tasks`, dan `activity_logs`.
- `join_code` digunakan untuk flow join kelompok.

### `group_members`

Fungsi: menyimpan anggota dan role dalam kelompok.

Kolom utama:

- `id`
- `group_id`
- `user_id`
- `role`
- `joined_at`

Relasi penting:

- `group_id` mengarah ke `groups.id`.
- `user_id` mengarah ke user/profile.
- `role` hanya `leader` atau `member`.
- Kombinasi `group_id` dan `user_id` harus unik.

### `projects`

Fungsi: menyimpan project dalam kelompok.

Kolom utama:

- `id`
- `group_id`
- `title`
- `description`
- `deadline`
- `status`
- `created_by`
- `created_at`
- `updated_at`

Relasi penting:

- `group_id` mengarah ke `groups.id`.
- `created_by` mengarah ke user/profile pembuat.
- Satu project punya banyak `tasks`.
- Progress project dihitung dari task selesai dibanding total task.

### `tasks`

Fungsi: menyimpan task project dan status pengerjaannya.

Kolom utama:

- `id`
- `project_id`
- `group_id`
- `title`
- `description`
- `assigned_to`
- `status`
- `priority`
- `weight`
- `deadline`
- `created_by`
- `approved_by`
- `approved_at`
- `created_at`
- `updated_at`

Relasi penting:

- `project_id` mengarah ke `projects.id`.
- `group_id` mengarah ke `groups.id` untuk RLS dan query cepat.
- `assigned_to` adalah anggota yang bertanggung jawab.
- `created_by` adalah ketua pembuat task.
- `approved_by` diisi saat ketua approve.
- Satu task punya banyak `task_evidences`, `task_comments`, `task_reviews`, dan `task_reassignments`.

### `task_evidences`

Fungsi: menyimpan metadata bukti pekerjaan.

Kolom utama:

- `id`
- `task_id`
- `uploaded_by`
- `evidence_type`
- `file_path`
- `external_url`
- `file_name`
- `file_size`
- `note`
- `created_at`

Relasi penting:

- `task_id` mengarah ke `tasks.id`.
- `uploaded_by` adalah user yang upload bukti.
- `file_path` diisi untuk file Supabase Storage.
- `external_url` diisi untuk link Google Drive, GitHub, Figma, atau draw.io.

### `task_comments`

Fungsi: menyimpan komentar pada task.

Kolom utama:

- `id`
- `task_id`
- `user_id`
- `comment`
- `created_at`

Relasi penting:

- `task_id` mengarah ke `tasks.id`.
- `user_id` adalah anggota kelompok yang memberi komentar.
- Komentar hanya dapat diakses anggota kelompok terkait.

### `task_reviews`

Fungsi: menyimpan riwayat review ketua.

Kolom utama:

- `id`
- `task_id`
- `reviewed_by`
- `review_status`
- `review_note`
- `created_at`

Relasi penting:

- `task_id` mengarah ke `tasks.id`.
- `reviewed_by` adalah ketua kelompok.
- `review_status` hanya `approved`, `revision`, atau `rejected`.
- `review_note` wajib jika status `revision` atau `rejected`.

### `task_reassignments`

Fungsi: menyimpan riwayat pemindahan task dari satu anggota ke anggota lain.

Kolom utama:

- `id`
- `task_id`
- `from_user_id`
- `to_user_id`
- `reassigned_by`
- `reason`
- `created_at`

Relasi penting:

- `task_id` mengarah ke `tasks.id`.
- `from_user_id` adalah pemilik task sebelumnya.
- `to_user_id` adalah pemilik task baru.
- `reassigned_by` adalah ketua.
- `reason` wajib diisi.

### `activity_logs`

Fungsi: menyimpan log aktivitas penting.

Kolom utama:

- `id`
- `group_id`
- `project_id`
- `task_id`
- `user_id`
- `action`
- `description`
- `metadata`
- `created_at`

Relasi penting:

- `group_id` mengarah ke `groups.id`.
- `project_id` opsional sesuai konteks aksi.
- `task_id` opsional sesuai konteks aksi.
- `user_id` adalah pelaku aksi.
- `metadata` menyimpan detail perubahan ringkas dalam JSON.

## RLS Rules

Aturan utama:

- User hanya bisa melihat kelompok yang dia ikuti.
- User hanya bisa melihat project dari kelompoknya.
- User hanya bisa melihat task dari kelompoknya.
- Anggota hanya bisa update task yang ditugaskan kepadanya.
- Anggota tidak bisa mengubah task langsung menjadi `done`.
- Anggota hanya bisa submit review jika task miliknya dan sudah memiliki bukti pekerjaan.
- Ketua bisa membuat, mengedit, review, approve, revisi, dan reassign task di kelompoknya.
- User luar kelompok tidak bisa melihat bukti pekerjaan.
- Activity log hanya bisa dilihat anggota kelompok terkait.
- Service role key tidak boleh digunakan di client.

Catatan implementasi:

- Validasi role harus dilakukan di server action dan tetap diperkuat dengan RLS.
- RLS harus memakai membership `group_members` sebagai dasar akses.
- Storage policy harus mengikuti membership group dari task terkait.
- Semua mutation penting harus membuat `activity_logs`.

## Storage Rules

Bucket:

- `task-evidences`

Struktur path:

```text
group-id/project-id/task-id/filename
```

Aturan file:

- Maksimal 3 file per task.
- Maksimal 5 MB per file.
- Format file: PDF, PNG, JPG, DOCX.
- File executable tidak boleh diupload.
- Link eksternal boleh untuk Google Drive, GitHub, Figma, dan draw.io.
- File hanya dapat diupload dan dibaca oleh anggota kelompok terkait.
- User luar kelompok tidak boleh melihat file atau metadata bukti.

## Validasi Utama

Task:

- Wajib punya `title`, `project_id`, `assigned_to`, `deadline`, `priority`, dan `weight`.
- `priority` hanya `low`, `medium`, atau `high`.
- `weight` harus angka positif.
- `assigned_to` harus anggota dari group task.

Review:

- Task tidak boleh `submit_review` tanpa bukti.
- Anggota hanya boleh submit task yang ditugaskan kepadanya.
- Revision note wajib jika ketua meminta revisi.
- Task yang direvisi belum dihitung sebagai kontribusi final.

Contribution:

- Kontribusi hanya dihitung dari task `approved` atau `done`.
- Task reassigned dihitung untuk anggota terakhir yang menyelesaikan.
- Penalti MVP:
  - Terlambat 1-2 hari: pengurangan 10%.
  - Terlambat lebih dari 2 hari: pengurangan 20%.
  - Revisi lebih dari 2 kali: pengurangan 10%.

Activity log:

- Wajib dibuat untuk task dibuat, task diassign, status berubah, bukti diupload, submit review, revisi, approve, reassign, komentar ditambahkan, dan laporan diexport.
- Log tidak boleh diedit oleh user.

## Aturan Teknis

- Gunakan Supabase Auth untuk session.
- Gunakan Supabase PostgreSQL untuk data utama.
- Gunakan Supabase Storage untuk file bukti.
- Gunakan Supabase RLS untuk semua akses data.
- Gunakan Server Actions untuk mutation database.
- Gunakan Zod untuk validasi input.
- Jangan expose `SUPABASE_SERVICE_ROLE_KEY` ke client.
- Jangan membuat business logic besar di `page.tsx`.
- Jangan menambahkan fitur di luar MVP tanpa permintaan eksplisit.
