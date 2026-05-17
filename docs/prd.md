# Product Requirements Document (PRD): PTSP Kemenag Barito Utara

## 1. Visi & Tujuan
Membangun portal Pelayanan Terpadu Satu Pintu (PTSP) yang modern, transparan, dan efisien untuk Kantor Kementerian Agama Kabupaten Barito Utara. Portal ini bertujuan untuk mendigitalkan alur birokrasi, mengurangi penggunaan kertas (paperless), dan memberikan kepastian status pengajuan bagi masyarakat secara realtime.

## 2. Target Pengguna
- **Masyarakat Umum**: Pemohon layanan (Pendaftaran Majelis Taklim, Rekomendasi Paspor Haji, dll).
- **Admin/Petugas PTSP**: Verifikator berkas per unit kerja (Pendidikan Islam, Bimas Islam, dll).
- **Super Admin**: Pengelola sistem, manajemen layanan, dan audit log.
- **Pimpinan**: Pemantau performa layanan melalui dashboard statistik.

## 3. Fitur Utama & Modul Spesifik

### A. Modul Publik (Frontend)
- **Service Catalog 2.0**: 
  - *Deep Search*: Mencari layanan berdasarkan nama, deskripsi, hingga kata kunci di dalam syarat dokumen.
  - *Smart Category*: Pengelompokan layanan berdasarkan unit kerja resmi Kemenag.
- **Wizard Pengajuan Interaktif**: 
  - Validasi file secara client-side (ukuran maks 5MB, format PDF/JPG).
  - *Auto-Save*: Menggunakan local storage untuk mencegah data hilang saat browser tertutup.
- **Tracking System**: 
  - Visualisasi Timeline (Step-by-step progress).
  - Status Badge: `Menunggu Verifikasi`, `Proses Berkas`, `Perlu Revisi`, `Selesai`, `Ditolak`.

### B. Modul Admin (Dashboard)
- **Advanced Service Management**: 
  - *Dynamic Form Builder*: Menentukan input apa saja yang harus diisi pemohon per layanan.
  - *Drag-and-Drop Reordering*: Mengatur urutan layanan dan syarat menggunakan `dnd-kit`.
- **Review Center**: 
  - *Document Viewer*: Melihat dokumen pemohon langsung di browser tanpa download.
  - *Revision Note*: Memberikan alasan spesifik jika dokumen ditolak.
- **Analytics Engine**: 
  - Chart interaktif (Line & Bar) untuk tren pengajuan bulanan.
  - Statistik per unit kerja untuk melihat beban kerja petugas.

### C. Modul Sistem & Keamanan
- **Audit Trail**: Mencatat IP Address dan aktivitas Admin untuk keamanan data.
- **Keep-Alive Heartbeat**: Eksekusi cron job harian via Vercel untuk mencegah Supabase standby mode.
- **BigInt Serialization**: Penanganan otomatis data ID besar (BigInt) untuk sinkronisasi DB ke UI.

## 4. UI/UX Design Standards (Emerald Theme)
- **Branding**: Dominasi warna **Emerald Green** (#059669) sesuai identitas institusi.
- **Style**: *Premium Modern Glassmorphism* dengan radius besar (`rounded-[2.5rem]`).
- **Interaction**: Animasi halus menggunakan `framer-motion` (LazyMotion) untuk transisi antar halaman.

## 5. Spesifikasi Teknis & Infrastruktur
- **Core**: Next.js 15+ (App Router) & TypeScript.
- **Database**: Supabase (PostgreSQL) dengan **Row Level Security (RLS)** aktif.
- **ORM**: Drizzle ORM dengan pola modular schema (Modularized by Domain).
- **Storage**: Cloudflare R2 atau Supabase Storage untuk penyimpanan dokumen aman.
- **Deployment**: Vercel (Production) dengan integrasi GitHub CI/CD.

## 6. Maintenance & Scalability
- **Code Limit**: Setiap file wajib di bawah 200 baris.
- **Modularization**: Memisahkan logika Server Actions (`_actions`) dan UI Components (`_components`).
- **SEO**: Dynamic metadata untuk setiap halaman layanan guna kemudahan pencarian di Google.
