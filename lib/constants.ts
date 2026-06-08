/**
 * Email yang ditetapkan sebagai Super Admin.
 * Super Admin adalah satu-satunya pengguna dengan hak akses tertinggi.
 * Tidak dapat diubah melalui UI.
 */
export const SUPER_ADMIN_EMAIL = "nazilahdeveloper@gmail.com";

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
  "pegawai",
] as const;

export type AppRole = typeof ADMIN_ROLES[number];

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
  "pengguna",
  "dokumen_hasil",
  "surat_masuk",
  "surat_keluar",
  "buku_tamu",
  "janji_temu",
  "saran_pengaduan",
  "log_audit",
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
export function getAdminSpecificRole(_email: string | null | undefined, baseRole: string): string {
  return baseRole;
}

/**
 * Dapatkan label display untuk sebuah role.
 */
export function getRoleLabel(role?: string | null, email?: string | null): string {
  if (isSuperAdmin(email)) return "Super Admin";

  const labels: Record<string, string> = {
    admin_ptsp: "Admin PTSP (Umum)",
    admin_sub_bagian_tata_usaha: "Admin Sub Bagian Tata Usaha",
    admin_pendidikan_madrasah: "Admin Pendidikan Madrasah",
    admin_pendidikan_agama_islam: "Admin Pendidikan Agama Islam",
    admin_pendidikan_diniyah_pondok_pesantren: "Admin Pendidikan Diniyah & Pondok Pesantren",
    admin_bimbingan_masyarakat_islam: "Admin Bimbingan Masyarakat Islam",
    admin_bimbingan_masyarakat_kristen_katolik: "Admin Bimbingan Masyarakat Kristen & Katolik",
    admin_penyelenggara_zakat_wakaf: "Admin Penyelenggara Zakat & Wakaf",
    admin_penyelenggara_hindu: "Admin Penyelenggara Hindu",
    kasubag_tu: "Kasubag TU",
    kepala_kantor: "Kepala Kantor",
    pegawai: "Pegawai",
    user: "Pemohon",
  };

  return labels[role ?? ""] || role || "Administrator";
}

