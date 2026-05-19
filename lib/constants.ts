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
  "buku_tamu",
  "janji_temu",
  "saran_pengaduan",
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
 * Dapatkan role spesifik bidang berdasarkan email untuk admin_ptsp.
 */
export function getAdminSpecificRole(email: string | null | undefined, baseRole: string): string {
  if (!email) return baseRole;
  const emailLower = email.toLowerCase();
  if (emailLower === "admin.penmad@kemenagbarut.go.id") return "admin_pendidikan_madrasah";
  if (emailLower === "admin.pais@kemenagbarut.go.id") return "admin_pendidikan_agama_islam";
  if (emailLower === "admin.pdpontren@kemenagbarut.go.id") return "admin_pendidikan_diniyah_pondok_pesantren";
  if (emailLower === "admin.bimasislam@kemenagbarut.go.id") return "admin_bimbingan_masyarakat_islam";
  if (emailLower === "admin.kristen@kemenagbarut.go.id") return "admin_bimbingan_masyarakat_kristen_katolik";
  if (emailLower === "admin.zawa@kemenagbarut.go.id") return "admin_penyelenggara_zakat_wakaf";
  if (emailLower === "admin.hindu@kemenagbarut.go.id") return "admin_penyelenggara_hindu";
  return baseRole;
}

