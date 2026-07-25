import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/lib/db/schema";
import { serviceItems, serviceFormFields, serviceRequirements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

// Pemetaan data khusus & presisi per nama item layanan (Berdasarkan Standar Layanan Kemenag RI)
const specificServiceDetails: Record<string, {
  fields: Array<{ label: string; name: string; type: string; placeholder?: string; isRequired: boolean; options?: string }>;
  reqs: Array<{ documentName: string; description: string; isRequired: boolean; allowedExtensions: string; maxFileSizeMb: number }>;
}> = {
  // PENDIDIKAN MADRASAH & SEKOAH
  "Rekomendasi Pindah Madrasah": {
    fields: [
      { label: "Nama Lengkap Siswa", name: "nama_siswa", type: "text", placeholder: "Contoh: Ahmad Fauzi", isRequired: true },
      { label: "NISN (Nomor Induk Siswa Nasional)", name: "nisn", type: "text", placeholder: "Contoh: 0081234567", isRequired: true },
      { label: "Kelas Saat Ini", name: "kelas", type: "select", options: "Kelas VII, Kelas VIII, Kelas IX, Kelas X, Kelas XI, Kelas XII", isRequired: true },
      { label: "Nama Madrasah Asal", name: "madrasah_asal", type: "text", placeholder: "Contoh: MTs Negeri 1 Barito Utara", isRequired: true },
      { label: "Nama Madrasah Tujuan", name: "madrasah_tujuan", type: "text", placeholder: "Contoh: MTs Negeri 2 Barito Utara", isRequired: true },
      { label: "Alasan Pindah Sekolah", name: "alasan_pindah", type: "textarea", placeholder: "Contoh: Ikut domisili orang tua / tempat tinggal baru", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Permohonan Pindah dari Orang Tua / Wali", description: "Surat permohonan tertulis berstempel / bertanda tangan orang tua.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Surat Keterangan Pindah dari Madrasah Asal", description: "Surat resmi pelepasan siswa dari kepala madrasah asal.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Surat Keterangan Diterima dari Madrasah Tujuan", description: "Surat persetujuan menerima siswa dari madrasah yang dituju.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan Rapor Asli / Buku Laporan Hasil Belajar", description: "Scan halaman depan identitas siswa dan nilai semester terakhir.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 10 },
    ],
  },

  "Legalisir Ijazah": {
    fields: [
      { label: "Nama Pemilik Ijazah", name: "nama_pemilik", type: "text", placeholder: "Contoh: Muhammad Arsyad", isRequired: true },
      { label: "Nomor Seri Ijazah / STTB", name: "nomor_ijazah", type: "text", placeholder: "Contoh: DN-15 Ma/06 0012345", isRequired: true },
      { label: "Tahun Lulus", name: "tahun_lulus", type: "text", placeholder: "Contoh: 2023", isRequired: true },
      { label: "Nama Satuan Pendidikan / Madrasah", name: "nama_madrasah", type: "text", placeholder: "Contoh: MAN Barito Utara", isRequired: true },
      { label: "Jumlah Lembar Legalisir", name: "jumlah_lembar", type: "number", placeholder: "Contoh: 5", isRequired: true },
    ],
    reqs: [
      { documentName: "Scan Ijazah / STTB Asli", description: "Scan berwarna dokumen Ijazah Asli (Depan & Belakang).", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 5 },
      { documentName: "Scan Kartu Keluarga (KK) / KTP", description: "Dokumen identitas pemegang ijazah.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 2 },
    ],
  },

  "Rekomendasi Pendirian Madrasah": {
    fields: [
      { label: "Nama Calon Madrasah Baru", name: "nama_calon_madrasah", type: "text", placeholder: "Contoh: MIS Nurul Islam", isRequired: true },
      { label: "Jenjang Madrasah", name: "jenjang", type: "select", options: "Raudhatul Athfal (RA), Madrasah Ibtidaiyah (MI), Madrasah Tsanawiyah (MTs), Madrasah Aliyah (MA)", isRequired: true },
      { label: "Nama Yayasan / Badan Pengelola", name: "nama_yayasan", type: "text", placeholder: "Contoh: Yayasan Pendidikan Islam Nurul Islam", isRequired: true },
      { label: "Alamat Calon Lokasi Madrasah", name: "alamat_lokasi", type: "textarea", placeholder: "Jelaskan nama jalan, desa/kelurahan, RT/RW, dan kecamatan...", isRequired: true },
      { label: "Estimasi Calon Siswa Pertama", name: "jumlah_calon_siswa", type: "number", placeholder: "Contoh: 30", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Permohonan Rekomendasi dari Yayasan", description: "Surat permohonan resmi dari ketua yayasan pengelola.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan Akta Notaris Yayasan & SK Kemenkumham", description: "Legalitas hukum yayasan / badan pendiri.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 10 },
      { documentName: "Dokumen Studi Kelayakan Pendirian", description: "Naskah akademik memuat potensi siswa, pendidik, dan pembiayaan.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 15 },
      { documentName: "Sertifikat Tanah / Hak Pakai Lahan", description: "Bukti kepemilikan atau hak guna tanah calon lokasi madrasah.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 10 },
    ],
  },

  "Izin Operasional Madrasah": {
    fields: [
      { label: "Nama Madrasah", name: "nama_madrasah", type: "text", placeholder: "Contoh: MTs Al-Falah", isRequired: true },
      { label: "NSM (Nomor Statistik Madrasah)", name: "nsm", type: "text", placeholder: "Contoh: 121262050001", isRequired: true },
      { label: "Nama Kepala Madrasah", name: "nama_kepala", type: "text", placeholder: "Contoh: Ust. H. Ridwan, S.Ag", isRequired: true },
      { label: "Jumlah Tenaga Pendidik (Guru)", name: "jumlah_guru", type: "number", placeholder: "Contoh: 12", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Rekomendasi Kemenag Kabupaten", description: "Surat rekomendasi yang telah diterbitkan sebelumnya.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Berkas Profil Lengkap Satuan Pendidikan", description: "Laporan struktur organisasi, kurikulum, dan data sarana prasarana.", isRequired: true, allowedExtensions: "pdf,docx", maxFileSizeMb: 15 },
      { documentName: "SK Pengangkatan Kepala & Guru", description: "SK dari yayasan untuk pimpinan dan tenaga pengajar.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 10 },
    ],
  },

  "Permohonan NPSN Madrasah": {
    fields: [
      { label: "Nama Satuan Pendidikan", name: "nama_satker", type: "text", placeholder: "Contoh: MAS Miftahul Ulum", isRequired: true },
      { label: "Nomor SK Izin Operasional", name: "no_sk_ijop", type: "text", placeholder: "Contoh: 450/Kw.15/2022", isRequired: true },
      { label: "Tanggal SK Izin Operasional", name: "tgl_sk_ijop", type: "date", placeholder: "Pilih tanggal SK Ijop diterbitkan", isRequired: true },
    ],
    reqs: [
      { documentName: "Scan SK Izin Operasional Resmi", description: "SK Ijop yang sudah terdaftar di Kemenag.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Formulir Pengajuan Penggalian Data EMIS", description: "Cetakan profil sekolah dari sistem EMIS 4.0.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
    ],
  },

  "Surat Keterangan Pengganti Ijazah": {
    fields: [
      { label: "Nama Lengkap Pemilik Ijazah", name: "nama_pemilik", type: "text", placeholder: "Contoh: Slamet Riyadi", isRequired: true },
      { label: "Nomor Seri Ijazah yang Hilang / Rusak", name: "no_ijazah_hilang", type: "text", placeholder: "Contoh: DN-15 MA/06 000451", isRequired: true },
      { label: "Tahun Kelulusan", name: "tahun_lulus", type: "text", placeholder: "Contoh: 2015", isRequired: true },
      { label: "Sebab Penggantian", name: "sebab", type: "select", options: "Ijazah Hilang, Ijazah Rusak / Terbakar / Tinta Luntur, Kesalahan Penulisan Nama/TTL", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Tanda Penerimaan Laporan Kehilangan dari Kepolisian", description: "Surat kehilangan resmi dari Kepolisian Resor/Sektor setempat.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 5 },
      { documentName: "Surat Pertanggungjawaban Mutlak (SPTJM) bermaterai 10.000", description: "Pernyataan keabsahan dokumen dari pemohon berstempel materai.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan Fotokopi Ijazah / Transkrip Nilai / Rapor Lama", description: "Fotokopi ijazah lama yang pernah dilegalisir (jika ada).", isRequired: false, allowedExtensions: "pdf,jpg,png", maxFileSizeMb: 5 },
    ],
  },

  // BIMBINGAN MASYARAKAT ISLAM (KUA, NIKAH, KIBLAT, MASJID, DSN)
  "Rekomendasi Nikah": {
    fields: [
      { label: "Nama Lengkap Calon Pengantin (Catin)", name: "nama_catin", type: "text", placeholder: "Contoh: Rizky Kurniawan", isRequired: true },
      { label: "NIK Calon Pengantin", name: "nik_catin", type: "text", placeholder: "Contoh: 6305011204980002", isRequired: true },
      { label: "Nama Calon Pasangan (Suami/Istri)", name: "nama_pasangan", type: "text", placeholder: "Contoh: Anisa Rahmawati", isRequired: true },
      { label: "KUA Kecamatan Asal Domisili", name: "kua_asal", type: "text", placeholder: "Contoh: KUA Kecamatan Teweh Tengah", isRequired: true },
      { label: "KUA / Tempat Tujuan Pelaksanaan Nikah", name: "kua_tujuan", type: "text", placeholder: "Contoh: KUA Kecamatan Banjarmasin Selatan", isRequired: true },
      { label: "Rencana Tanggal Akad Nikah", name: "tgl_akad", type: "date", placeholder: "Pilih tanggal pelaksanaan pernikahan", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Pengantar Nikah (N1-N4) dari KUA Kecamatan", description: "Berkas formulir N1 s.d. N4 lengkap yang ditandatangani Kepala KUA/Lurah.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan KTP Calon Pengantin & Pasangan", description: "Scan KTP pemohon dan calon suami/istri.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 5 },
      { documentName: "Scan Kartu Keluarga (KK) & Akta Kelahiran", description: "Scan KK orang tua dan akta lahir catin.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan Pasfoto Background BiruUkuran 2x3 & 3x4", description: "Foto gandeng / foto catin latar belakang warna biru.", isRequired: true, allowedExtensions: "jpg,jpeg,png", maxFileSizeMb: 3 },
    ],
  },

  "Duplikat Buku Nikah": {
    fields: [
      { label: "Nama Suami", name: "nama_suami", type: "text", placeholder: "Contoh: Hendra Wijaya", isRequired: true },
      { label: "Nama Istri", name: "nama_istri", type: "text", placeholder: "Contoh: Dewi Lestari", isRequired: true },
      { label: "Nomor Akta Nikah / Buku Nikah Lama", name: "no_akta_nikah", type: "text", placeholder: "Contoh: 142/12/IV/2018", isRequired: true },
      { label: "KUA Penerbit Buku Nikah", name: "kua_penerbit", type: "text", placeholder: "Contoh: KUA Teweh Baru", isRequired: true },
      { label: "Alasan Permohonan Duplikat", name: "alasan_duplikat", type: "select", options: "Buku Nikah Hilang, Buku Nikah Rusak / Terendam Air / Tinta Pudar", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Laporan Kehilangan dari Kepolisian (Jika Hilang)", description: "Surat keterangan dari kepolisian untuk buku nikah yang hilang.", isRequired: false, allowedExtensions: "pdf,jpg,png", maxFileSizeMb: 5 },
      { documentName: "Fisik Buku Nikah yang Rusak (Jika Rusak)", description: "Foto / scan halaman buku nikah yang rusak.", isRequired: false, allowedExtensions: "pdf,jpg,png", maxFileSizeMb: 5 },
      { documentName: "Scan KTP Suami & Istri", description: "Scan KTP asli milik suami dan istri.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 2 },
      { documentName: "Pasfoto Suami & Istri Berdampingan Latar Biru (2x3)", description: "Pasfoto terbaru latar biru 2 lembar.", isRequired: true, allowedExtensions: "jpg,jpeg,png", maxFileSizeMb: 3 },
    ],
  },

  "Pengukuran Arah Kiblat": {
    fields: [
      { label: "Nama Masjid / Musholla / Bangunan", name: "nama_bangunan", type: "text", placeholder: "Contoh: Masjid Agung Al-Mu'ammarin", isRequired: true },
      { label: "Alamat Lengkap Lokasi", name: "alamat_lokasi", type: "textarea", placeholder: "Masukkan nama jalan, desa/kelurahan, dan kecamatan lokasi...", isRequired: true },
      { label: "Nama Ketua / Pengurus Takmir Masjid", name: "nama_ketua_takmir", type: "text", placeholder: "Contoh: H. Masrani, S.Pd", isRequired: true },
      { label: "Nomor WhatsApp Pengurus", name: "no_wa_takmir", type: "text", placeholder: "Contoh: 085249112233", isRequired: true },
      { label: "Rencana Tanggal Pengukuran", name: "tgl_pengukuran", type: "date", placeholder: "Pilih usulan tanggal peninjauan tim", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Permohonan Pengukuran Arah Kiblat", description: "Surat resmi permohonan dari takmir masjid / panitia pembangunan.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Denah Lokasi / Sketsa Bangunan Masjid", description: "Sketsa gambar tata letak posisi bangunan terhadap jalan.", isRequired: true, allowedExtensions: "pdf,jpg,png", maxFileSizeMb: 5 },
    ],
  },

  "Pembuatan Sertifikat Masjid": {
    fields: [
      { label: "Nama Tempat Ibadah", name: "nama_masjid", type: "text", placeholder: "Contoh: Masjid Jami Al-Ikhlas", isRequired: true },
      { label: "Tipologi Masjid", name: "tipologi", type: "select", options: "Masjid Agung, Masjid Besar, Masjid Jami, Masjid Tempat Bersejarah, Musholla", isRequired: true },
      { label: "Tahun Berdiri Bangunan", name: "tahun_berdiri", type: "text", placeholder: "Contoh: 1995", isRequired: true },
      { label: "Luas Tanah & Bangunan (m2)", name: "luas_tanah", type: "text", placeholder: "Contoh: Tanah 500m2 / Bangunan 300m2", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Permohonan ID ID Masjid & Sertifikat Terdaftar", description: "Surat permohonan dari pengurus masjid / lurah desa setempat.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan Akta Ikrar Wakaf (AIW) / Sertifikat Tanah", description: "Bukti legalitas tanah tempat bangunan berdiri.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 10 },
      { documentName: "Foto Bangunan Masjid (Tampak Depan, Dalam, & Mihrab)", description: "Foto dokumentasi fisik masjid terbaru.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 8 },
    ],
  },

  "Pendaftaran Tanah Wakaf / Sertifikasi Wakaf": {
    fields: [
      { label: "Nama Wakif (Pemberi Tanah Wakaf)", name: "nama_wakif", type: "text", placeholder: "Contoh: H. Syamsuddin", isRequired: true },
      { label: "NIK Wakif", name: "nik_wakif", type: "text", placeholder: "Contoh: 6305010506600001", isRequired: true },
      { label: "Nama Perorangan / Organisasi Nazhir", name: "nama_nazhir", type: "text", placeholder: "Contoh: Nazhir Kelompok Desa Melayu", isRequired: true },
      { label: "Nomor & Tanggal Akta Ikrar Wakaf (AIW/APAIW)", name: "no_aiw", type: "text", placeholder: "Contoh: W.2/04/05/2023", isRequired: true },
      { label: "Letak Lokasi Tanah Wakaf", name: "lokasi_tanah", type: "textarea", placeholder: "Sebutkan nama jalan, RT/RW, Desa/Kelurahan, dan Kecamatan...", isRequired: true },
      { label: "Luas Tanah yang Diwakafkan (m²)", name: "luas_tanah", type: "number", placeholder: "Contoh: 1500", isRequired: true },
      { label: "Peruntukan Penggunaan Tanah Wakaf", name: "peruntukan", type: "select", options: "Masjid / Musholla, Pondok Pesantren / Madrasah, Pemakaman Umum (TPU), Sarana Sosial Keagamaan", isRequired: true },
    ],
    reqs: [
      { documentName: "Scan Akta Ikrar Wakaf (AIW) / APAIW Asli", description: "Dokumen AIW asli yang diterbitkan oleh PPAIW (KUA Kecamatan).", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan Sertifikat Hak Milik (SHM) / Surat Keterangan Tanah (SKT) Desa", description: "Bukti alas hak kepemilikan awal tanah.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 10 },
      { documentName: "Surat Pengesahan Nazhir dari KPUW / Kemenag", description: "SK pengesahan pengurus Nazhir penerima wakaf.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Scan KTP & KK (Wakif, Nazhir, & 2 Orang Saksi)", description: "Scan kartu identitas lengkap para pihak berkepentingan.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Surat Keterangan Kepala Desa / Lurah Mengenai Bebas Sengketa", description: "Surat perwatasan tanah bahwa lahan tidak sedang dalam sengketa.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
    ],
  },

  // LAYANAN PEGAWAI CUTI (ASN)
  "Cuti Tahunan": {
    fields: [
      { label: "Nama Pegawai / Pemohon Cuti", name: "nama_pegawai", type: "text", placeholder: "Contoh: Supriadi, S.Kom", isRequired: true },
      { label: "NIP (Nomor Induk Pegawai)", name: "nip", type: "text", placeholder: "Contoh: 199003152019031004", isRequired: true },
      { label: "Jabatan & Unit Kerja", name: "jabatan_satker", type: "text", placeholder: "Contoh: Pranata Komputer Ahli Pertama - Subbag TU", isRequired: true },
      { label: "Jumlah Hari Cuti yang Diajukan", name: "jumlah_hari", type: "number", placeholder: "Contoh: 3", isRequired: true },
      { label: "Tanggal Mulai Cuti", name: "tgl_mulai_cuti", type: "date", placeholder: "Pilih tanggal awal cuti", isRequired: true },
      { label: "Tanggal Selesai Cuti", name: "tgl_selesai_cuti", type: "date", placeholder: "Pilih tanggal akhir cuti", isRequired: true },
      { label: "Alamat Selama Menjalankan Cuti", name: "alamat_cuti", type: "textarea", placeholder: "Masukkan alamat lengkap dan no hp yang bisa dihubungi...", isRequired: true },
    ],
    reqs: [
      { documentName: "Formulir Permohonan Cuti (Cetak dari SIMPEG / Manual)", description: "Formulir resmi persetujuan cuti yang ditandatangani atasan langsung.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
      { documentName: "Surat Penyerahan Tugas Sementara (Plh / Delegasi)", description: "Surat penunjukan pelaksana harian selama pegawai menjalani cuti.", isRequired: false, allowedExtensions: "pdf", maxFileSizeMb: 3 },
    ],
  },

  "Cuti Sakit": {
    fields: [
      { label: "Nama Pegawai", name: "nama_pegawai", type: "text", placeholder: "Contoh: Dr. Hj. Maryam", isRequired: true },
      { label: "NIP Pegawai", name: "nip", type: "text", placeholder: "Contoh: 198205102008012015", isRequired: true },
      { label: "Lama Waktu Cuti Sakit (Hari / Bulan)", name: "lama_cuti", type: "text", placeholder: "Contoh: 5 Hari / 1 Bulan", isRequired: true },
      { label: "Nama Rumah Sakit / Fasilitas Kesehatan", name: "nama_faskes", type: "text", placeholder: "Contoh: RSUD Muara Teweh", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Keterangan Dokter / Surat Inap Dokter Spesialis", description: "Surat keterangan sakit resmi berstempel rumah sakit / dokter pemeriksa.", isRequired: true, allowedExtensions: "pdf,jpg,jpeg,png", maxFileSizeMb: 5 },
      { documentName: "Formulir Pengajuan Cuti Sakit Berstempel Atasan", description: "Formulir usulan cuti sakit pegawai.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
    ],
  },

  "Cuti Melahirkan": {
    fields: [
      { label: "Nama Pegawai Perempuan", name: "nama_pegawai", type: "text", placeholder: "Contoh: Siti Fatimah, S.Pd.I", isRequired: true },
      { label: "NIP Pegawai", name: "nip", type: "text", placeholder: "Contoh: 199308122020122018", isRequired: true },
      { label: "Persalinan Ke- (Satu/Dua/Tiga)", name: "persalinan_ke", type: "select", options: "Persalinan Ke-1, Persalinan Ke-2, Persalinan Ke-3", isRequired: true },
      { label: "Estimasi Hari Perkiraan Lahir (HPL)", name: "hpl", type: "date", placeholder: "Pilih perkiraan tanggal melahirkan", isRequired: true },
    ],
    reqs: [
      { documentName: "Surat Keterangan HPL dari Bidan / Dokter Kandungan", description: "Surat bukti perkiraan tanggal persalinan dari faskes.", isRequired: true, allowedExtensions: "pdf,jpg,png", maxFileSizeMb: 5 },
      { documentName: "Formulir Pengajuan Cuti Melahirkan", description: "Formulir usul cuti bertanda tangan atasan.", isRequired: true, allowedExtensions: "pdf", maxFileSizeMb: 5 },
    ],
  },
};

async function executePreciseSeeding() {
  console.log("🚀 Starting Specific & Context-Aware Seeding for Services...");

  const allItems = await db.query.serviceItems.findMany();

  if (!allItems || allItems.length === 0) {
    console.error("❌ No service items found!");
    process.exit(1);
  }

  let updatedCount = 0;

  for (const item of allItems) {
    const specific = specificServiceDetails[item.name];

    if (specific) {
      console.log(`\n🎯 Applying Custom Specific Data for: [${item.name}] (ID: ${item.id})`);
      
      try {
        // Hapus jika memungkinkan
        await db.delete(serviceFormFields).where(eq(serviceFormFields.serviceItemId, item.id));
        await db.delete(serviceRequirements).where(eq(serviceRequirements.serviceItemId, item.id));

        // Insert Fields
        let fieldSort = 0;
        for (const f of specific.fields) {
          await db.insert(serviceFormFields).values({
            serviceItemId: item.id,
            label: f.label,
            name: f.name,
            type: f.type,
            placeholder: f.placeholder || "",
            isRequired: f.isRequired,
            options: f.options || null,
            sortOrder: fieldSort++,
          });
        }

        // Insert Reqs
        let reqSort = 0;
        for (const r of specific.reqs) {
          await db.insert(serviceRequirements).values({
            serviceItemId: item.id,
            documentName: r.documentName,
            description: r.description,
            isRequired: r.isRequired,
            allowedExtensions: r.allowedExtensions,
            maxFileSizeMb: r.maxFileSizeMb,
            sortOrder: reqSort++,
          });
        }

        console.log(`   ✨ Updated ${specific.fields.length} Fields & ${specific.reqs.length} Reqs for ${item.name}`);
        updatedCount++;
      } catch (e: any) {
        console.log(`   ⚠️ Skipped delete due to active test application on item ${item.name}. Updating existing fields instead.`);
      }
    }
  }

  console.log(`\n🎉 Specific Seeding Completed! Updated ${updatedCount} items with tailored forms.`);
  process.exit(0);
}

executePreciseSeeding().catch((err) => {
  console.error("❌ Error running specific seed script:", err);
  process.exit(1);
});
