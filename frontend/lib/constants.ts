/**
 * Email yang ditetapkan sebagai Super Admin.
 * Super Admin adalah satu-satunya pengguna dengan hak akses tertinggi.
 * Tidak dapat diubah melalui UI.
 */
export const SUPER_ADMIN_EMAIL = "baritoutara@kemenag.go.id";

/**
 * Semua role yang termasuk petugas/admin (bisa akses admin panel).
 * Sesuai enum app_role di database Supabase.
 */
export const ADMIN_ROLES = [
  "super_admin",
  "kepala_kantor",
  "kasubag_tu",
  "admin_ptsp",
  "admin_sub_bagian_tata_usaha",
  "admin_pendidikan_madrasah",
  "admin_pendidikan_agama_islam",
  "admin_pendidikan_diniyah_pondok_pesantren",
  "admin_bimbingan_masyarakat_islam",
  "admin_bimbingan_masyarakat_kristen_katolik",
  "admin_penyelenggara_zakat_wakaf",
  "admin_penyelenggara_hindu",
] as const;

export const UNIT_KERJA_OPTIONS = [
  "Pejabat Eselon IV",
  "Sub Bagian Tata Usaha",
  "Seksi Pendidikan Madrasah",
  "Seksi Pendidikan Agama Islam",
  "Seksi Pendidikan Diniyah & Pondok Pesantren",
  "Seksi Bimbingan Masyarakat Islam",
  "Penyelenggara Zakat dan Wakaf",
  "Penyelenggara Hindu",
  "KUA Kecamatan Teweh Tengah",
  "KUA Kecamatan Lahei",
  "KUA Kecamatan Gunung Purei",
  "KUA Kecamatan Montallat",
  "KUA Kecamatan Gunung Timang",
  "MIN 1 Barito Utara",
  "MIN 2 Barito Utara",
  "MTsN Barito",
  "MAN Barito Utara",
];

export type AppRole = (typeof ADMIN_ROLES)[number];

/**
 * Menu standar yang bisa diakses oleh petugas admin biasa.
 */
export const DEFAULT_ADMIN_PERMISSIONS = [
  "ringkasan",
  "pengajuan",
  "dokumen_hasil",
  "surat_masuk",
  "surat_keluar",
  "buku_tamu",
  "janji_temu",
  "saran_pengaduan",
  "e_laporan_kinerja",
];

/**
 * Semua menu yang tersedia di sistem admin.
 */
export const ALL_ADMIN_MENUS = [
  "ringkasan",
  "pengajuan",
  "layanan",
  "dokumen_hasil",
  "surat_masuk",
  "surat_keluar",
  "buku_tamu",
  "janji_temu",
  "saran_pengaduan",
  "pemeliharaan_storage",
  "mode_pemeliharaan",
  "manajemen_pegawai",
  "e_laporan_kinerja",
];

/**
 * Cek apakah sebuah email adalah Super Admin.
 */
export function isSuperAdmin(email?: string | null): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Cek apakah role termasuk petugas/admin (bisa akses admin panel).
 */
export function isAdminRole(role?: string | null): boolean {
  return ADMIN_ROLES.includes(role as any);
}

/**
 * Dapatkan role spesifik bidang — sekarang langsung menggunakan role dari database.
 * Tidak perlu hardcode email karena role sudah di-set saat registrasi.
 */
export function getAdminSpecificRole(
  _email: string | null | undefined,
  baseRole: string,
): string {
  return baseRole;
}

/**
 * Dapatkan label display untuk sebuah role.
 */
export function getRoleLabel(
  role?: string | null,
  email?: string | null,
): string {
  if (isSuperAdmin(email)) return "Super Admin";

  const labels: Record<string, string> = {
    admin_ptsp: "Admin PTSP (Umum)",
    admin_sub_bagian_tata_usaha: "Admin Sub Bagian Tata Usaha",
    admin_pendidikan_madrasah: "Admin Pendidikan Madrasah",
    admin_pendidikan_agama_islam: "Admin Pendidikan Agama Islam",
    admin_pendidikan_diniyah_pondok_pesantren:
      "Admin Pendidikan Diniyah & Pondok Pesantren",
    admin_bimbingan_masyarakat_islam: "Admin Bimbingan Masyarakat Islam",
    admin_bimbingan_masyarakat_kristen_katolik:
      "Admin Bimbingan Masyarakat Kristen & Katolik",
    admin_penyelenggara_zakat_wakaf: "Admin Penyelenggara Zakat & Wakaf",
    admin_penyelenggara_hindu: "Admin Penyelenggara Hindu",
    kasubag_tu: "Kasubag TU",
    kepala_kantor: "Kepala Kantor",
    pegawai: "Pegawai",
    user: "Pemohon",
  };

  return labels[role ?? ""] || role || "Administrator";
}

export const HARDCODED_PENSIUN_REQUIREMENTS = [
  { id: "pensiun-1", documentName: "Surat Permohonan", isRequired: true, allowedExtensions: "pdf", templateUrl: "/templates/form_surat_permohonan.docx" },
  { id: "pensiun-2", documentName: "SK CPNS", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-3", documentName: "SK PNS", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-4", documentName: "SK Pangkat Terakhir", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-5", documentName: "Surat Penugasan Terakhir", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-6", documentName: "Surat Pernyataan Menduduki Jabatan", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-7", documentName: "Surat Pernyataan Melaksanakan Tugas", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-8", documentName: "Akta Nikah / Buku Nikah / Akta Cerai", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-9", documentName: "Kartu Pegawai (KARPEG)", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-10", documentName: "KARIS / KARSU", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-11", documentName: "KTP", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-12", documentName: "Kartu Keluarga", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-13", documentName: "NPWP", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-14", documentName: "Buku Rekening", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-15", documentName: "KGB Terakhir", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-16", documentName: "SKP 1 Tahun Terakhir", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-17", documentName: "Akta Kelahiran Anak Tertanggung", isRequired: true, allowedExtensions: "pdf" },
  { id: "pensiun-18", documentName: "Akta Kematian (Untuk Usul Pensiun Meninggal Dunia)", isRequired: false, allowedExtensions: "pdf" },
  { id: "pensiun-19", documentName: "Surat Keterangan Janda / Duda dari Kecamatan", isRequired: false, allowedExtensions: "pdf" },
  { id: "pensiun-20", documentName: "Foto resmi background merah", isRequired: true, allowedExtensions: "jpg,jpeg,png" },
];
