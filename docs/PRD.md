# PRD - CircleTask

CircleTask adalah aplikasi manajemen tugas kelompok berbasis bukti kerja. Aplikasi ini membantu ketua dan anggota kelompok mengatur pembagian task, memantau progres, upload bukti pekerjaan, melakukan review, validasi ketua, reassign task, mencatat activity log, menghitung kontribusi anggota, dan export laporan kontribusi PDF.

Dokumen ini diturunkan dari `PRD - CircleTask.pdf` di root workspace dan menjadi source of truth lokal untuk scope MVP, role, business rules, database, RLS, storage, dan alur aplikasi.

## 1. Ringkasan Produk

CircleTask dibuat untuk menyelesaikan masalah umum dalam tugas kelompok:

- Anggota tidak aktif.
- Klaim pekerjaan tanpa bukti.
- Pembagian tugas tidak jelas.
- Riwayat revisi tersebar di chat atau folder eksternal.
- Kontribusi anggota sulit dihitung secara objektif.
- Laporan kontribusi dibuat manual dan tidak rapi.

CircleTask bukan sekadar todo list. CircleTask memakai pendekatan task management berbasis bukti kerja, validasi ketua, activity log, dan kontribusi yang transparan.

## 2. Tujuan Produk

Tujuan utama:

- Membantu kelompok membagi tugas secara jelas dan terstruktur.
- Mencegah klaim progres palsu tanpa bukti pekerjaan.
- Memberikan mekanisme validasi hasil kerja oleh ketua kelompok.
- Mencatat aktivitas pengerjaan tugas secara transparan.
- Menghitung kontribusi anggota berdasarkan task yang benar-benar dikerjakan.
- Menghasilkan laporan kontribusi otomatis dalam bentuk PDF.

## 3. Target Pengguna

Target pengguna:

- Mahasiswa yang sering mengerjakan tugas kelompok.
- Ketua kelompok yang bertanggung jawab membagi dan memantau tugas.
- Tim kecil yang membutuhkan pembagian tugas dan laporan kontribusi.

Role MVP:

| Role | Deskripsi |
| --- | --- |
| Ketua Kelompok | Pengguna yang membuat kelompok, project, task, melakukan validasi, dan export laporan. |
| Anggota | Pengguna yang bergabung ke kelompok, mengerjakan task, upload bukti, dan submit pekerjaan. |

Tidak ada role dosen di MVP.

## 4. Solusi dan Alur Kerja

Alur utama CircleTask:

1. Ketua membuat kelompok.
2. Anggota bergabung menggunakan kode undangan.
3. Ketua membuat project atau tugas besar.
4. Ketua membagi task kepada anggota.
5. Anggota mengerjakan task dan upload bukti pekerjaan.
6. Anggota mengajukan task untuk direview.
7. Ketua memvalidasi hasil kerja.
8. Jika sesuai, task disetujui dan masuk status Done.
9. Jika belum sesuai, task dikembalikan ke status Revisi.
10. Sistem mencatat semua aktivitas dan menghitung kontribusi anggota.
11. Ketua dapat export laporan kontribusi PDF.

## 5. Scope MVP

Fitur yang masuk MVP:

- Autentikasi pengguna.
- Manajemen profil pengguna.
- Buat kelompok.
- Join kelompok menggunakan kode.
- Manajemen anggota kelompok.
- Buat project.
- Buat task.
- Assign task ke anggota.
- Update status task.
- Upload bukti pekerjaan.
- Submit task untuk review.
- Validasi task oleh ketua.
- Revisi task.
- Reassign task ke anggota lain.
- Activity log.
- Komentar task.
- Dashboard kelompok.
- Perhitungan kontribusi sederhana.
- Export laporan kontribusi PDF.

Fitur di luar MVP:

- Role dosen.
- Dashboard dosen.
- Sistem penilaian akademik.
- Chat realtime penuh.
- Integrasi WhatsApp.
- Integrasi GitHub commit otomatis.
- Integrasi Google Drive otomatis.
- AI summary laporan.
- Mobile app native.
- Payment atau premium plan.

## 6. Tech Stack

Frontend:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- React Hook Form.
- Zod.

Backend-as-a-Service:

- Supabase Auth.
- Supabase PostgreSQL.
- Supabase Storage.
- Supabase Row Level Security.

Hosting:

- Vercel untuk aplikasi Next.js.
- Supabase untuk auth, database, dan storage.

Export PDF:

- React PDF untuk MVP.

## 7. Role dan Hak Akses

Ketua Kelompok dapat:

- Membuat kelompok.
- Mengedit data kelompok.
- Mengundang anggota.
- Menghapus anggota dari kelompok.
- Membuat project.
- Mengedit project.
- Membuat task.
- Assign task ke anggota.
- Mengubah deadline task.
- Melakukan review task.
- Approve task.
- Meminta revisi task.
- Menolak bukti pekerjaan.
- Reassign task ke anggota lain.
- Melihat dashboard kontribusi.
- Export laporan PDF.

Anggota dapat:

- Join kelompok menggunakan kode.
- Melihat project kelompok.
- Melihat task yang diberikan.
- Mengubah status task menjadi In Progress.
- Upload bukti pekerjaan.
- Submit task untuk review.
- Menanggapi revisi.
- Memberi komentar pada task.
- Melihat progress kelompok.
- Melihat skor kontribusi sendiri.

## 8. Status Task

Status task:

- `todo`
- `in_progress`
- `submit_review`
- `revision`
- `approved`
- `done`

Alur utama:

```text
todo -> in_progress -> submit_review -> approved -> done
                         |
                         v
                      revision
```

Aturan penting:

- Anggota tidak bisa langsung mengubah task menjadi `done`.
- Task hanya bisa `done` setelah divalidasi ketua.
- Poin kontribusi hanya dihitung jika task sudah `approved` atau `done`.
- Task tidak bisa `submit_review` jika belum ada bukti pekerjaan.

## 9. Fitur Detail

### Autentikasi

Fitur:

- Register akun.
- Login.
- Logout.
- Reset password.
- Edit profil.

Data profil minimal:

- Nama lengkap.
- Email.
- Foto profil opsional.

Acceptance criteria:

- Pengguna bisa register menggunakan email.
- Pengguna bisa login.
- Pengguna yang belum login tidak bisa mengakses dashboard.
- Session pengguna tetap aktif selama token masih valid.

### Manajemen Kelompok

Fitur:

- Ketua membuat kelompok.
- Sistem membuat kode join otomatis.
- Anggota join menggunakan kode.
- Ketua melihat daftar anggota.
- Ketua dapat menghapus anggota.
- Ketua dapat mengganti nama kelompok.

Data kelompok:

- Nama kelompok.
- Deskripsi.
- Kode join.
- Ketua kelompok.
- Tanggal dibuat.

Acceptance criteria:

- Pengguna yang membuat kelompok otomatis menjadi ketua.
- Anggota hanya bisa join jika kode valid.
- Anggota yang sudah join dapat melihat project dan task kelompok.
- User tidak bisa melihat kelompok yang bukan miliknya.

### Manajemen Project

Fitur:

- Ketua membuat project.
- Ketua mengisi nama project.
- Ketua mengisi deskripsi project.
- Ketua menentukan deadline project.
- Sistem menampilkan progress project.

Data project:

- Nama project.
- Deskripsi.
- Deadline.
- Status.
- Group ID.
- Created by.

Acceptance criteria:

- Hanya ketua yang bisa membuat project.
- Anggota hanya bisa melihat project.
- Progress project dihitung dari jumlah task selesai dibanding total task.

### Manajemen Task

Fitur:

- Ketua membuat task.
- Ketua assign task ke anggota.
- Ketua menentukan deadline task.
- Ketua menentukan bobot kontribusi.
- Ketua menentukan prioritas.
- Anggota melihat task miliknya.
- Anggota update status task.
- Anggota submit task untuk review.

Data task:

- Judul task.
- Deskripsi.
- Project ID.
- Assigned user.
- Status.
- Prioritas.
- Bobot kontribusi.
- Deadline.
- Created by.

Acceptance criteria:

- Task wajib memiliki judul, project, deadline, dan assigned user.
- Anggota hanya bisa submit task yang ditugaskan kepadanya.
- Task tidak bisa Done tanpa approval ketua.
- Task terlambat diberi label Overdue.

### Upload Bukti Pekerjaan

Fitur:

- Anggota upload bukti pekerjaan.
- Bukti bisa berupa file atau link.
- File disimpan di Supabase Storage.
- Metadata file disimpan di database.
- Bukti ditampilkan di halaman detail task.

Jenis bukti:

- PDF.
- PNG.
- JPG.
- DOCX.
- Link Google Drive.
- Link GitHub.
- Link Figma.
- Link draw.io.

Aturan upload MVP:

- Maksimal 3 file per task.
- Maksimal 5 MB per file.
- Format file dibatasi: PDF, PNG, JPG, DOCX.
- File besar diarahkan menggunakan link eksternal.

Acceptance criteria:

- Anggota tidak bisa submit review jika belum ada bukti.
- Bukti yang diupload dapat dilihat oleh ketua.
- User di luar kelompok tidak bisa mengakses bukti.

### Review dan Validasi Ketua

Fitur:

- Ketua melihat daftar task yang menunggu review.
- Ketua membuka bukti pekerjaan.
- Ketua memilih Approve atau Revisi.
- Jika revisi, ketua wajib memberi catatan.
- Jika approve, task masuk status `approved` atau `done`.
- Sistem mencatat aktivitas review.

Acceptance criteria:

- Hanya ketua yang bisa approve atau revisi.
- Revisi wajib memiliki catatan.
- Task yang disetujui masuk perhitungan kontribusi.
- Task yang direvisi belum masuk kontribusi final.

### Reassign Task

Fitur:

- Ketua dapat memindahkan task dari satu anggota ke anggota lain.
- Ketua wajib mengisi alasan reassign.
- Sistem mencatat riwayat pengalihan task.
- Task berpindah ke anggota baru.
- Poin kontribusi diberikan kepada anggota yang menyelesaikan task.

Acceptance criteria:

- Reassign hanya dapat dilakukan oleh ketua.
- Reassign wajib memiliki alasan.
- Riwayat reassign tampil pada activity log.
- Anggota lama tidak mendapat poin jika tidak mengerjakan task.

### Komentar Task

Fitur:

- Ketua dan anggota dapat berkomentar di task.
- Komentar digunakan untuk diskusi, revisi, dan klarifikasi.
- Komentar disimpan berdasarkan task.

Acceptance criteria:

- User hanya bisa komentar pada task di kelompoknya.
- Komentar tampil berdasarkan waktu terbaru atau kronologis.
- Komentar tidak dapat diakses user luar kelompok.

### Activity Log

Aktivitas yang dicatat:

- Task dibuat.
- Task diassign.
- Status task berubah.
- Bukti diupload.
- Task disubmit review.
- Task direvisi.
- Task diapprove.
- Task direassign.
- Komentar ditambahkan.
- Laporan diexport.

Acceptance criteria:

- Setiap aktivitas penting tercatat otomatis.
- Log menampilkan nama user, aksi, waktu, dan detail perubahan.
- Log tidak bisa diedit oleh user.

### Skor Kontribusi

Komponen MVP:

- Bobot task.
- Status task.
- Ketepatan deadline.
- Jumlah revisi.

Rumus awal:

```text
Skor Anggota = Total bobot task approved milik anggota
Persentase = Skor anggota / Total skor semua anggota * 100
```

Penalti sederhana:

- Terlambat 1-2 hari: pengurangan 10%.
- Terlambat lebih dari 2 hari: pengurangan 20%.
- Revisi lebih dari 2 kali: pengurangan 10%.

Aturan:

- Task yang belum `approved` atau `done` tidak dihitung.
- Task yang direassign dihitung untuk anggota terakhir yang menyelesaikan.
- Ketua tetap bisa melihat detail kontribusi per task.

Acceptance criteria:

- Sistem menampilkan persentase kontribusi tiap anggota.
- Kontribusi dihitung dari task yang sudah `approved` atau `done`.
- Sistem menampilkan detail sumber poin kontribusi.

### Dashboard Kelompok

Isi dashboard:

- Total project.
- Total task.
- Task selesai.
- Task terlambat.
- Task menunggu review.
- Progress project.
- Kontribusi anggota.
- Deadline terdekat.

Acceptance criteria:

- Ketua dan anggota dapat melihat dashboard kelompok.
- Data dashboard sesuai dengan task terbaru.
- Progress project dihitung otomatis.

### Export Laporan PDF

Fitur:

- Ketua dapat export laporan kontribusi.
- Laporan berisi detail project dan kontribusi anggota.
- Laporan dapat diunduh sebagai PDF.

Isi laporan:

- Nama kelompok.
- Nama project.
- Daftar anggota.
- Daftar task.
- Task per anggota.
- Status task.
- Bukti pekerjaan.
- Riwayat reassign.
- Activity log ringkas.
- Skor kontribusi.
- Kesimpulan kontribusi.

Acceptance criteria:

- Ketua dapat mengunduh laporan PDF.
- PDF menampilkan kontribusi anggota dengan jelas.
- PDF dapat digunakan sebagai lampiran pengumpulan tugas.

## 10. Database Design Awal

Tabel utama:

- `profiles`
- `groups`
- `group_members`
- `projects`
- `tasks`
- `task_evidences`
- `task_comments`
- `task_reviews`
- `task_reassignments`
- `activity_logs`

Detail teknis ringkas tersedia di `docs/technical-spec.md`.

## 11. Row Level Security

Aturan RLS utama:

- User hanya bisa melihat kelompok yang dia ikuti.
- User hanya bisa melihat project dari kelompok yang dia ikuti.
- User hanya bisa melihat task dari kelompok yang dia ikuti.
- Anggota hanya bisa update task yang ditugaskan kepadanya.
- Ketua bisa membuat, mengedit, approve, revisi, dan reassign task di kelompoknya.
- User luar kelompok tidak bisa melihat file bukti.
- Activity log hanya bisa dilihat anggota kelompok terkait.

## 12. Storage Rules

Bucket Supabase Storage:

- `task-evidences`

Struktur path:

```text
task-evidences/group-id/project-id/task-id/filename
```

Aturan:

- File hanya dapat diupload oleh anggota kelompok.
- File hanya dapat dibaca oleh anggota kelompok.
- File maksimal 5 MB.
- Format file dibatasi.
- File tidak boleh berupa executable.

## 13. Non-Functional Requirements

Performance:

- Dashboard harus terbuka kurang dari 3 detik pada data kecil.
- Query task harus dipaginasi jika data banyak.
- File upload maksimal 5 MB per file.

Security:

- Semua halaman dashboard wajib butuh login.
- Validasi role dilakukan di server atau RLS, bukan hanya frontend.
- File bukti tidak boleh publik tanpa kontrol akses.
- Environment variable Supabase tidak boleh bocor.
- Service role key tidak boleh digunakan di client.

Usability:

- UI sederhana dan mudah dipahami.
- Status task jelas.
- Tombol utama mudah ditemukan.
- Dashboard menampilkan progress secara ringkas.

Reliability:

- Data task tidak boleh hilang saat user refresh.
- Upload file harus memberikan feedback sukses atau gagal.
- Jika submit review gagal, user mendapat pesan error.

## 14. Halaman Aplikasi

Halaman yang perlu dibuat:

- Landing Page.
- Login.
- Register.
- Dashboard.
- Daftar Kelompok.
- Detail Kelompok.
- Buat Kelompok.
- Join Kelompok.
- Daftar Project.
- Detail Project.
- Buat Project.
- Daftar Task.
- Detail Task.
- Review Task.
- Kontribusi Anggota.
- Activity Log.
- Export Laporan.
- Profil Pengguna.

Detail route tersedia di `docs/app-flow.md`.

## 15. Prioritas Pengembangan

Sprint 1 - Setup Dasar:

- Setup Next.js.
- Setup Tailwind CSS.
- Setup shadcn/ui.
- Setup Supabase.
- Setup Auth.
- Setup layout dashboard.

Sprint 2 - Kelompok dan Project:

- Buat kelompok.
- Join kelompok.
- Daftar anggota.
- Buat project.
- Detail project.

Sprint 3 - Task Management:

- Buat task.
- Assign task.
- Update status task.
- Detail task.
- Komentar task.

Sprint 4 - Bukti dan Review:

- Upload bukti pekerjaan.
- Submit review.
- Approve task.
- Revisi task.
- Activity log.

Sprint 5 - Kontribusi dan Laporan:

- Hitung kontribusi.
- Dashboard progress.
- Export laporan PDF.
- Final testing.
- Deploy ke Vercel.

Backlog teknis per sprint tersedia di `docs/backlog.md`.

## 16. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Anggota upload bukti palsu | Kontribusi tidak valid | Wajib validasi ketua dan activity log. |
| Storage Supabase cepat penuh | Upload gagal | Batasi ukuran file dan gunakan link eksternal. |
| User bisa akses data kelompok lain | Masalah keamanan | Terapkan RLS ketat. |
| Ketua terlalu terbebani review | Validasi lambat | Buat halaman review task yang ringkas. |
| Project Supabase free terkena pause | Aplikasi tidak aktif sementara | Gunakan keep-alive request berkala jika diperlukan. |
| Laporan PDF terlalu berat | Export gagal | Batasi isi laporan MVP dan gunakan ringkasan. |

## 17. Success Metrics

Project dianggap berhasil jika:

- User dapat membuat dan bergabung ke kelompok.
- Ketua dapat membuat project dan task.
- Anggota dapat mengupload bukti pekerjaan.
- Anggota tidak bisa menyelesaikan task tanpa review ketua.
- Ketua dapat approve atau revisi task.
- Sistem mencatat activity log.
- Sistem dapat menghitung kontribusi anggota.
- Ketua dapat export laporan PDF.
- Data kelompok aman dan tidak dapat diakses user luar kelompok.
- Aplikasi berhasil dideploy di Vercel dan terhubung ke Supabase.

## 18. Kesimpulan

CircleTask adalah aplikasi manajemen tugas kelompok berbasis bukti kerja. Dengan fitur pembagian task, upload bukti, validasi ketua, reassign task, activity log, skor kontribusi, dan export laporan PDF, aplikasi ini membantu kelompok bekerja lebih transparan dan adil.

Untuk MVP, stack yang digunakan adalah Next.js, TypeScript, Tailwind CSS, Supabase, dan Vercel. Stack ini dipilih karena tidak membutuhkan VPS, mudah dideploy, mendukung auth, database, storage, dan cocok untuk project portofolio modern.
