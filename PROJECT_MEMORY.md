# 🧠 Project Memory: PTSP Kemenag Barito Utara

File ini berisi panduan, aturan, dan riwayat penting untuk menjaga konsistensi pengembangan portal PTSP Kemenag Barito Utara.

---

## 🏛️ Identitas & Branding
- **Warna Utama**: Emerald Green (Zamrud). Gunakan palet `#059669`, `#064e3b`, dan `#047857`.
- **Dilarang**: Menggunakan warna Blue, Indigo, atau Violet (kecuali untuk indikator status sistem yang sangat spesifik).
- **Style UI**: *Premium Modern*. Gunakan radius besar (`rounded-[2.5rem]`), efek *Glassmorphism*, gradasi halus, dan animasi `framer-motion`.
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
    - Mendukung *Deep Search* (mencari hingga ke dalam syarat dokumen).
    - Mendukung logika pencarian AND (spasi) dan OR (koma).
    - Fitur *Auto-Expand* jika hasil pencarian mengerucut ke 1 unit.
    - Komponen `TextHighlight` wajib digunakan untuk menandai kecocokan kata kunci.
- **Sistem Pelacakan**: Desain transparan dengan *Timeline* modern untuk memantau status dokumen warga.

## ⚙️ Optimasi & Standar Perbaikan (Zero Error Policy)
1.  **Recharts Fix**: Wajib menggunakan `ResizeObserver` dan pengecekan `offsetWidth > 0` sebelum merender `ResponsiveContainer` guna menghindari error dimensi `-1` di konsol.
2.  **CSP Compliance**: Dilarang memanggil aset media (suara/video) dari URL eksternal di dashboard admin. Simpan aset di `/public/sounds/` untuk menghindari pemblokiran *Content Security Policy*.
3.  **Strict TypeScript**: Selalu gunakan tipe data eksplisit pada parameter callback (misal: `(c: string)`) untuk menjamin kelancaran proses `npm run build`.

## 🛠️ Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: Prisma ORM (PostgreSQL)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React

## ⚠️ Aturan Pengembangan (Rules of Engagement)
1.  **Konsistensi Card**: Semua kartu informasi utama wajib menggunakan `rounded-[2.5rem]` dan bayangan `shadow-xl` atau `shadow-2xl`.
2.  **Transparansi**: Informasi syarat layanan harus selalu bisa diakses publik tanpa perlu login.
3.  **Optimasi Gambar**: Selalu gunakan kompresi gambar sebelum diunggah ke storage guna efisiensi biaya dan kecepatan akses.
4.  **SEO**: Pastikan setiap halaman memiliki metadata yang tepat untuk kemudahan pencarian di Google.

---
*Terakhir Diperbarui: 16 Mei 2026*
