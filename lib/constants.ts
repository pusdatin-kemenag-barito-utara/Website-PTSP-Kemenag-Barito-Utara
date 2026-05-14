/**
 * Email yang ditetapkan sebagai Super Admin.
 * Super Admin adalah satu-satunya pengguna dengan hak akses tertinggi.
 * Tidak dapat diubah melalui UI.
 */
export const SUPER_ADMIN_EMAIL = "nazilahmuhammad1998@gmail.com";

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
  "log_audit",
  "pemeliharaan_storage",
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
