# App Flow dan Route - CircleTask

Dokumen ini menggabungkan user flow utama dan route Next.js App Router. Semua flow mengikuti `docs/PRD.md` sebagai source of truth.

## User Flow

### Register dan Login

1. User membuka `/register` untuk membuat akun email.
2. Sistem membuat user Supabase Auth dan record `profiles`.
3. User login melalui `/login`.
4. User yang sudah login diarahkan ke `/dashboard`.
5. User tanpa session tidak boleh mengakses protected routes.

### Membuat Kelompok

1. User login.
2. User membuka `/groups/new`.
3. User mengisi nama dan deskripsi kelompok.
4. Sistem membuat `groups` dan generate `join_code`.
5. Sistem membuat record `group_members` dengan role `leader`.
6. Kelompok muncul di dashboard dan daftar kelompok.

### Join Kelompok

1. User login.
2. User membuka `/groups/join`.
3. User memasukkan join code.
4. Sistem memvalidasi kode.
5. Sistem membuat record `group_members` dengan role `member`.
6. Kelompok muncul di dashboard user.

### Membuat Project

1. Ketua membuka `/groups/[groupId]/projects/new`.
2. Ketua mengisi title, description, dan deadline.
3. Sistem menyimpan project dengan `group_id` dan `created_by`.
4. Project tampil di daftar project dan dashboard kelompok.

### Membuat Task

1. Ketua membuka project.
2. Ketua membuka `/groups/[groupId]/projects/[projectId]/tasks/new`.
3. Ketua mengisi title, description, assigned user, deadline, priority, dan weight.
4. Sistem membuat task dengan status awal `todo`.
5. Sistem mencatat activity log task dibuat dan task diassign.

### Anggota Mengerjakan Task

1. Anggota membuka task yang ditugaskan kepadanya.
2. Anggota mengubah status dari `todo` atau `revision` menjadi `in_progress`.
3. Sistem menyimpan perubahan status dan mencatat activity log.
4. Anggota tidak boleh mengubah task langsung menjadi `done`.

### Upload Bukti Pekerjaan

1. Anggota membuka detail task.
2. Anggota upload file atau menambahkan link eksternal.
3. File disimpan di bucket `task-evidences`.
4. Metadata bukti disimpan di `task_evidences`.
5. Sistem membatasi maksimal 3 file per task dan 5 MB per file.
6. Sistem mencatat activity log bukti diupload.

### Submit Review

1. Anggota membuka task miliknya.
2. Sistem memastikan task sudah punya minimal satu bukti.
3. Anggota klik Submit Review.
4. Sistem mengubah status task menjadi `submit_review`.
5. Sistem mencatat activity log.
6. Task tampil di halaman review ketua.

### Ketua Approve Task

1. Ketua membuka `/groups/[groupId]/review`.
2. Ketua melihat task status `submit_review`.
3. Ketua membuka bukti pekerjaan.
4. Ketua memilih Approve.
5. Sistem membuat record `task_reviews` dengan `review_status = approved`.
6. Sistem mengubah task menjadi `approved` atau `done` sesuai aturan implementasi MVP.
7. Sistem mencatat `approved_by`, `approved_at`, dan activity log.
8. Task masuk perhitungan kontribusi.

### Ketua Meminta Revisi

1. Ketua membuka task yang menunggu review.
2. Ketua memilih Revisi.
3. Ketua wajib mengisi revision note.
4. Sistem membuat record `task_reviews` dengan `review_status = revision`.
5. Sistem mengubah status task menjadi `revision`.
6. Sistem mencatat activity log.
7. Task belum masuk kontribusi final.

### Reassign Task

1. Ketua membuka detail task.
2. Ketua memilih aksi Reassign.
3. Ketua memilih anggota pengganti.
4. Ketua wajib mengisi alasan reassign.
5. Sistem membuat record `task_reassignments`.
6. Sistem mengubah `assigned_to` ke anggota baru.
7. Sistem mencatat activity log.
8. Poin kontribusi diberikan ke anggota yang menyelesaikan task.

### Komentar Task

1. Ketua atau anggota kelompok membuka detail task.
2. User menambahkan komentar.
3. Sistem menyimpan komentar ke `task_comments`.
4. Sistem mencatat activity log komentar ditambahkan.
5. User luar kelompok tidak boleh melihat atau membuat komentar.

### Activity Log

1. Sistem mencatat aksi penting secara otomatis.
2. Log menampilkan user, action, waktu, dan detail perubahan.
3. Log hanya dapat dilihat anggota kelompok terkait.
4. Log tidak dapat diedit user.

### Kontribusi

1. Sistem mengambil task dengan status `approved` atau `done`.
2. Sistem menghitung skor dari weight task.
3. Penalti diterapkan untuk task terlambat dan revisi lebih dari 2 kali.
4. Task reassigned dihitung untuk anggota terakhir yang menyelesaikan.
5. Persentase = skor anggota / total skor semua anggota * 100.
6. Ketua melihat semua kontribusi; anggota melihat minimal kontribusi dirinya dan ringkasan kelompok.

### Export Laporan PDF

1. Ketua membuka `/groups/[groupId]/report`.
2. Sistem menampilkan preview laporan.
3. Ketua export PDF.
4. PDF berisi kelompok, project, anggota, task, bukti, reassign, activity log ringkas, dan skor kontribusi.
5. Sistem mencatat activity log laporan diexport.

## Route Next.js App Router

### Public Routes

| Route | Tujuan halaman | Aktor | Aksi utama |
| --- | --- | --- | --- |
| `/` | Landing page CircleTask. | Guest, user | Melihat ringkasan produk dan masuk ke login/register. |
| `/login` | Login user. | Guest | Login dengan email dan password. |
| `/register` | Registrasi user. | Guest | Membuat akun baru dan profil awal. |

### Protected Routes

| Route | Tujuan halaman | Aktor | Aksi utama |
| --- | --- | --- | --- |
| `/dashboard` | Ringkasan kelompok, task, review, deadline, dan kontribusi. | Ketua, Anggota | Melihat overview dan navigasi ke kelompok/task. |
| `/groups` | Daftar kelompok user. | Ketua, Anggota | Melihat kelompok yang diikuti, masuk detail, buat atau join kelompok. |
| `/groups/new` | Form membuat kelompok. | User login | Membuat kelompok dan otomatis menjadi ketua. |
| `/groups/join` | Form join kelompok. | User login | Join menggunakan kode undangan. |
| `/groups/[groupId]` | Dashboard kelompok. | Ketua, Anggota kelompok | Melihat statistik, progress, task terbaru, dan deadline. |
| `/groups/[groupId]/members` | Daftar anggota kelompok. | Ketua, Anggota kelompok | Melihat anggota; ketua dapat mengelola anggota sesuai MVP. |
| `/groups/[groupId]/projects` | Daftar project dalam kelompok. | Ketua, Anggota kelompok | Melihat project; ketua dapat membuka aksi buat project. |
| `/groups/[groupId]/projects/new` | Form membuat project. | Ketua | Membuat project baru dalam kelompok. |
| `/groups/[groupId]/projects/[projectId]` | Detail project. | Ketua, Anggota kelompok | Melihat progress, task, deadline, dan ringkasan project. |
| `/groups/[groupId]/projects/[projectId]/tasks` | Task board project. | Ketua, Anggota kelompok | Melihat task berdasarkan status dan prioritas. |
| `/groups/[groupId]/projects/[projectId]/tasks/new` | Form membuat task. | Ketua | Membuat task, assign anggota, deadline, priority, dan weight. |
| `/groups/[groupId]/projects/[projectId]/tasks/[taskId]` | Detail task. | Ketua, assigned member, anggota kelompok | Melihat detail, bukti, komentar, update status, submit review, review, atau reassign sesuai role. |
| `/groups/[groupId]/review` | Daftar task menunggu review. | Ketua | Approve atau minta revisi task. |
| `/groups/[groupId]/contribution` | Halaman kontribusi. | Ketua, Anggota kelompok | Melihat skor kontribusi dan detail sumber poin. |
| `/groups/[groupId]/activity` | Activity log kelompok. | Ketua, Anggota kelompok | Melihat riwayat aksi penting. |
| `/groups/[groupId]/report` | Preview dan export laporan. | Ketua | Melihat preview dan export laporan kontribusi PDF. |
| `/profile` | Profil pengguna. | User login | Melihat dan mengedit nama lengkap serta avatar opsional. |
