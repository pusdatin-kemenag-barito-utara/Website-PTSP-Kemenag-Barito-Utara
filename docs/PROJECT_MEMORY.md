# 🧠 Project Memory: PTSP Kemenag Barito Utara

File ini berisi panduan, aturan, dan riwayat penting untuk menjaga konsistensi pengembangan portal PTSP Kemenag Barito Utara.

---

## 🏛️ Identitas & Branding

- **Warna Utama**: Emerald Green (Zamrud). Gunakan palet `#059669`, `#064e3b`, dan `#047857`.
- **Dilarang**: Menggunakan warna Blue, Indigo, atau Violet (kecuali untuk indikator status sistem yang sangat spesifik).
- **Style UI**: _Premium Modern_. Gunakan radius besar (`rounded-[2.5rem]`), efek _Glassmorphism_, gradasi halus, dan animasi `framer-motion` (Wajib menggunakan komponen `m` dengan `LazyMotion` strict mode).
- **Tipografi**: Gunakan berat font `font-black` untuk judul utama guna memberikan kesan institusional yang kuat.

## 📂 Struktur Organisasi & Layanan

Penyusunan kategori harus mengikuti struktur resmi Kantor Kemenag Barito Utara:

1.  **Sub Bagian Tata Usaha**: Segala urusan administrasi umum dan kepegawaian.
2.  **Pendidikan Islam**: Mencakup Madrasah, Pendidikan Agama Islam (PAI), serta Pendidikan Diniyah dan Pondok Pesantren (Pontren).
3.  **Bimbingan Masyarakat (Inklusif)**: Melayani semua agama (Islam, Kristen, Katolik, Hindu). Hindari penggunaan nama yang hanya spesifik satu agama di level kategori utama.
4.  **Zakat & Wakaf**: Layanan terkait penyelenggaraan zakat dan wakaf.
5.  **Catatan Penting**: **Haji & Umrah** tidak dimasukkan dalam kategori publik karena perbedaan instansi/alur teknis.

## 🚀 Fitur Unggulan & Logika Teknis

- **Katalog Layanan Maksimal**:
  - Mendukung _Deep Search_ (mencari hingga ke dalam syarat dokumen).
  - Mendukung logika pencarian AND (spasi) dan OR (koma).
  - Fitur _Auto-Expand_ jika hasil pencarian mengerucut ke 1 unit.
  - Komponen `TextHighlight` wajib digunakan untuk menandai kecocokan kata kunci.
- **Sistem Pelacakan**: Desain transparan dengan _Timeline_ modern untuk memantau status dokumen warga.

## 🧠 Protokol 10-Poin 'Muscle Memory' (Standard Pengembangan)

1.  **Zero Console Error (Recharts)**: Wajib menggunakan `ResizeObserver` dan pengecekan `offsetWidth > 0` sebelum merender `ResponsiveContainer` guna menghindari error dimensi `-1`.
2.  **CSP & Asset Security**: Dilarang menggunakan URL eksternal untuk aset media. Gunakan `/public/sounds/` atau storage internal guna mematuhi _Content Security Policy_.
3.  **TS Production Stability**: 
    - Gunakan tipe eksplisit pada callback array.
    - Gunakan `db.transaction(async (tx) => { ... })` untuk integritas data.
    - Gunakan utilitas `serializeBigInt` untuk setiap data BigInt yang dikirim ke UI.
4.  **Aturan 200 Baris**: File dilarang melebihi 200 baris. Jika membengkak, wajib modularisasi ke folder `_components` atau `_actions`.
5.  **Modularisasi Domain-Driven**: Skema database dan komponen wajib dikelompokkan berdasarkan domain fitur (misal: auth, services, logs). Relasi database terpusat di `relations.ts`.
6.  **Pola Atomik & SRP**: Setiap fungsi atau komponen harus memiliki satu tanggung jawab saja (_Single Responsibility Principle_). Gunakan `turbopack: {}` di config untuk Next.js 16+.
7.  **Strict RLS & Auth Validation**: Wajib mengaktifkan Row Level Security (RLS) pada setiap tabel dan memvalidasi kepemilikan data melalui `auth.uid()` serta pengecekan session di Server Actions.
8.  **Zod Schema Consistency**: Setiap input data (Form/API) wajib divalidasi menggunakan skema `zod` terpusat untuk menjamin integritas data sebelum diproses.
9.  **Optimasi Aset & Storage**: Gunakan _Pre-signed URL_ untuk dokumen privat (R2/Supabase). Wajib kompresi gambar/PDF di sisi client sebelum upload guna efisiensi storage.
10. **Unified Error & Feedback**: Gunakan blok `try-catch` konsisten di Server Actions dengan feedback visual `sonner` (toast) dan fallback UI (Loading/Empty State) yang estetik.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Drizzle ORM (PostgreSQL via node-postgres)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React

## ⚠️ Aturan Pengembangan (Rules of Engagement)

1.  **Konsistensi Card**: Semua kartu informasi utama wajib menggunakan `rounded-[2.5rem]` dan bayangan `shadow-xl` atau `shadow-2xl`.
2.  **Transparansi**: Informasi syarat layanan harus selalu bisa diakses publik tanpa perlu login.
3.  **Optimasi Gambar**: Selalu gunakan kompresi gambar sebelum diunggah ke storage guna efisiensi biaya dan kecepatan akses.
4.  **SEO**: Pastikan setiap halaman memiliki metadata yang tepat untuk kemudahan pencarian di Google.

---

_Terakhir Diperbarui: 16 Mei 2026_
