# 🏛️ PTSP Barito Utara - AI Development Protocol
> *Standar Baku Modernisasi & Pengembangan AI-Assisted*

Dokumen ini adalah "Muscle Memory" untuk AI dan Developer dalam menjaga integritas arsitektur portal PTSP Kemenag Barito Utara. **WAJIB DIPATUHI** untuk setiap perubahan kode.

## 1. Arsitektur: Service Layer Pattern
**JANGAN** menulis logika bisnis, query database kompleks, atau manipulasi file langsung di `route.ts`, `page.tsx`, atau Server Actions.
- Semua logika harus berada di `lib/services/`.
- Gunakan Class static (misal: `RequestService.updateStatus`).
- UI/API hanya bertugas memanggil Service dan menangani respon.

## 2. Standardisasi Respon (ActionResult)
Setiap method mutation di Service Layer **HARUS** mengembalikan objek dengan struktur:
```typescript
{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}
```

## 3. Penanganan BigInt (PostgreSQL)
Karena database menggunakan `BigInt` untuk ID, pastikan:
- Gunakan helper `serializeBigInt(data)` dari `@/lib/db` sebelum mengirim data ke Client.
- Konversi input string ke BigInt menggunakan `BigInt(id)` saat melakukan query.

## 4. Keamanan Database (Hardening)
- **RLS (Row Level Security)**: Setiap tabel baru wajib memiliki kebijakan RLS (terutama yang berkaitan dengan data user/dokumen).
- **Secure Functions**: Gunakan `SET search_path = public` pada setiap fungsi PostgreSQL untuk mencegah *search_path injection*.

## 5. Manajemen File (Dual-Storage)
Setiap unggahan dokumen wajib diunggah ke dua tempat:
1. **Cloudflare R2**: Sebagai storage utama untuk akses cepat aplikasi.
2. **Google Drive**: Sebagai backup arsip yang terorganisir per user & per nomor pengajuan.
- Gunakan helper `sanitizeFilename` untuk membersihkan nama file dari karakter aneh.

## 6. Validasi Data: Zod & Schema
- Gunakan `zod` untuk validasi input di sisi server.
- Pastikan schema Drizzle selalu tersinkronisasi dengan database melalui migrasi SQL resmi.

## 7. Audit Logging & Activity Logs
- Setiap perubahan status atau data krusial **WAJIB** mencatat:
  - `activity_logs`: Untuk riwayat per pengajuan (terlihat oleh user/admin).
  - `audit_logs`: Untuk sistem audit keamanan (hanya terlihat oleh Super Admin).

## 8. UI Consistency: Emerald Theme
- Gunakan palet warna **Emerald/Green** sebagai identitas utama Kemenag.
- Hindari warna Blue/Indigo kecuali untuk elemen netral.
- Gunakan komponen `PageHeader` dan `PageBanner` yang sudah distandarisasi.

## 9. Next.js Best Practices
- Gunakan `loading.tsx` dengan Skeleton Loader untuk setiap rute dashboard.
- Pastikan API Routes tidak mengandung direktif `"use server"`.
- Gunakan `Server Components` secara default, dan `Client Components` hanya jika ada interaktivitas (form, button click, dll).

## 10. Zero-Error Build Requirement
Sebelum melakukan push atau deploy, pastikan perintah berikut berjalan tanpa error:
```bash
npm run build
```
*Jika build gagal karena tipe data, perbaiki tipenya, jangan gunakan `any` kecuali dalam kondisi darurat yang terdokumentasi.*
