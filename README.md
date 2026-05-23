# PTSP Kemenag Barito Utara

Starter project Next.js untuk sistem Pelayanan Terpadu Satu Pintu (PTSP) Kemenag Barito Utara.

## Teknologi & Dependensi Utama

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) dengan React 19
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: 
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - [Framer Motion](https://www.framer.com/motion/)
  - [Lucide React](https://lucide.dev/) (Icons)
  - [Sonner](https://sonner.emilkowal.ski/) (Toast Notifications)
- **Database & ORM**: 
  - [PostgreSQL](https://www.postgresql.org/)
  - [Drizzle ORM](https://orm.drizzle.team/)
- **Backend as a Service (BaaS)**: [Supabase](https://supabase.com/) (Auth, PostgreSQL Database, Storage)
- **Form & Validasi**: 
  - [React Hook Form](https://react-hook-form.com/)
  - [Zod](https://zod.dev/)
- **Utilitas Dokumen**:
  - `pdf-lib`, `jspdf` (Pemrosesan PDF)
  - `exceljs` (Ekspor Excel)
- **Fitur Tambahan**: 
  - PWA Support (`@ducanh2912/next-pwa`)
  - Vercel Analytics & Speed Insights

## Prasyarat

- Node.js versi 24.x
- Akun dan Project Supabase

## Cara Menjalankan secara Lokal

1. **Install dependensi**

   ```bash
   npm install
   ```

2. **Pengaturan Environment**

   Salin `.env.example` ke `.env.local` (atau buat file `.env.local` baru jika tidak ada) lalu sesuaikan nilainya dengan konfigurasi Supabase Anda:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
   DATABASE_URL=postgres://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

3. **Inisialisasi Database (Drizzle ORM)**

   Project ini menggunakan Drizzle ORM untuk manajemen skema. Dorong skema terbaru ke database Supabase Anda:

   ```bash
   npx drizzle-kit push
   ```

4. **Siapkan Bucket Storage**

   Pastikan bucket berikut tersedia di Supabase Storage (bisa dibuat via UI Supabase):
   - `request-documents`
   - `generated-documents`

5. **Jalankan Aplikasi**

   ```bash
   npm run dev
   ```

6. **Buka Browser**

   Akses [http://localhost:3000](http://localhost:3000)

## Pengaturan Akun Admin

Project ini tidak secara otomatis membuat user ber-role admin karena sistem otentikasi terpusat pada Supabase Auth.
Langkah memberikan akses admin:

1. Register akun biasa melalui halaman registrasi aplikasi.
2. Buka Supabase Dashboard > SQL Editor, lalu jalankan query berikut:

   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'email-admin-anda@example.com';
   ```

3. Login ulang ke dalam aplikasi dengan akun tersebut untuk memuat role admin yang baru.

## Fitur Utama

- **Autentikasi**: Registrasi, login, logout, reset password terintegrasi Supabase Auth.
- **Dashboard**: Panel interaktif untuk pemohon dan admin.
- **Manajemen Layanan**: CRUD layanan, item layanan, field form dinamis, dan persyaratan dokumen.
- **Pengajuan Layanan**: Pengisian form berbasis database yang dinamis.
- **Manajemen Dokumen**: Upload dan penyimpanan berkas terintegrasi dengan Supabase Storage.
- **Workflow**: Proses review dokumen (terima, revisi, tolak).
- **Ekspor Dokumen**: Download dokumen hasil layanan (PDF/Excel) & log aktivitas.
- **Buku Tamu**: Pencatatan tamu (Guest Book) digital.
- **Janji Temu**: Penjadwalan pertemuan (Appointments).
- **Notifikasi**: Sistem notifikasi dalam aplikasi untuk melacak status pengajuan.

## Struktur Direktori Utama

- `app/` - Routing aplikasi Next.js (App Router), halaman, dan API routes.
- `components/` - Komponen UI React yang dapat digunakan ulang.
- `lib/` - Helper, konfigurasi library, dan definisi skema Drizzle ORM (`lib/db/schema`).
- `drizzle/` - File migrasi Drizzle (jika menggunakan workflow migrasi manual).
- `public/` - Aset statis seperti logo dan file PWA.

## Catatan Penting

- Validasi rute (admin vs pemohon) dilakukan melalui role pada tabel `profiles` dan diproses menggunakan middleware di sisi server.
- Semua kueri dan pembaruan database kritikal direkomendasikan berjalan di server-side untuk memastikan keamanan.
- Integrasi *Service Role Key* diperlukan pada kondisi backend khusus (misalnya server actions tertentu) jika dibutuhkan operasi tanpa RLS (Row Level Security).

## Panduan Deployment

Rekomendasi Deployment:
- **Frontend**: [Vercel](https://vercel.com)
- **Database, Auth & Storage**: [Supabase](https://supabase.com)

**Langkah Deployment**:
1. Impor project ke Vercel.
2. Atur Environment Variables di Vercel sama seperti di `.env.local`.
3. Pada Supabase Dashboard > Authentication > URL Configuration, pastikan URL produksi Vercel didaftarkan sebagai *Site URL* dan *Redirect URLs*.
4. Pastikan migrasi/push schema Drizzle telah dijalankan pada database produksi.
