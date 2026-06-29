# Project Context - CircleTask

## Ringkasan

CircleTask adalah aplikasi manajemen tugas kelompok berbasis bukti kerja. Aplikasi ini membantu ketua dan anggota kelompok membagi task, memantau progres, upload bukti pekerjaan, submit review, validasi ketua, reassign task, mencatat activity log, menghitung kontribusi anggota, dan export laporan kontribusi PDF.

CircleTask bukan sekadar todo list. Fokus utamanya adalah memastikan pekerjaan kelompok punya bukti, proses validasi, riwayat aktivitas, dan perhitungan kontribusi yang transparan.

## Masalah yang Diselesaikan

- Pembagian tugas kelompok sering tidak terdokumentasi.
- Anggota bisa mengklaim pekerjaan tanpa bukti.
- Ketua sulit memantau siapa yang benar-benar aktif.
- Riwayat revisi dan bukti tersebar di chat atau folder eksternal.
- Kontribusi sulit dihitung secara objektif.
- Reassign task tidak punya catatan resmi.
- Laporan kontribusi masih dibuat manual.

## Target Pengguna

- Mahasiswa yang mengerjakan tugas kelompok.
- Ketua kelompok yang perlu membagi, memantau, dan memvalidasi pekerjaan.
- Anggota kelompok yang perlu melihat task, upload bukti, dan submit review.
- Tim kecil yang membutuhkan pembagian kerja dan laporan kontribusi sederhana.

## Role Utama

| Role | Tanggung jawab |
| --- | --- |
| Ketua Kelompok | Membuat kelompok, project, task, assign task, review, approve, revisi, reassign, melihat kontribusi, dan export PDF. |
| Anggota | Join kelompok, melihat project/task, update status task, upload bukti, submit review, merespons revisi, komentar task, dan melihat kontribusi sendiri. |

Tidak ada role dosen di MVP.

## Scope MVP

Fitur MVP:

- Autentikasi dan profil pengguna.
- Buat dan join kelompok menggunakan kode.
- Manajemen anggota kelompok.
- Buat dan lihat project.
- Buat, assign, update, dan detail task.
- Upload bukti pekerjaan berupa file atau link.
- Submit task untuk review.
- Validasi ketua: approve atau revision.
- Reassign task dengan alasan.
- Komentar task.
- Activity log.
- Dashboard kelompok.
- Perhitungan kontribusi sederhana.
- Export laporan kontribusi PDF.

## Tech Stack

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- React Hook Form.
- Zod.
- Supabase Auth.
- Supabase PostgreSQL.
- Supabase Storage.
- Supabase Row Level Security.
- Vercel.
- React PDF untuk export laporan.

## Prinsip Utama Aplikasi

- Bukti kerja adalah dasar progres task.
- Anggota tidak bisa menyelesaikan task langsung menjadi `done`.
- Task selesai harus melalui validasi ketua.
- Kontribusi hanya dihitung dari task `approved` atau `done`.
- Setiap aksi penting harus masuk activity log.
- Akses data diamankan dengan Supabase RLS, bukan hanya kontrol UI.
- UI mengikuti desain Google Stitch sebagai source of truth visual.
- Scope implementasi harus tetap MVP dan tidak melebar.

## Di Luar MVP

Jangan implementasikan fitur berikut kecuali diminta eksplisit di luar fase MVP:

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
