/**
 * Email yang ditetapkan sebagai Super Admin (dikelola via Infisical Cloud).
 * Super Admin adalah satu-satunya pengguna dengan hak akses tertinggi.
 */
export const SUPER_ADMIN_EMAIL =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_SUPER_ADMIN_EMAIL) ||
  (typeof process !== "undefined" && (process.env.PUBLIC_SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL)) ||
  "";

/**
 * Seluruh data Unit Kerja, Role Admin, Menu Panel Admin, dan Izin Standar
 * dikelola secara dinamis melalui Database (kemenag_ptsp.ptsp_master_options)
 * dan dapat diedit, ditambah, atau dihapus langsung di Panel Admin:
 * Menu: Kepegawaian -> Unit Kerja & Role (/admin/kepegawaian/unit-kerja)
 *
 * TIDAK ADA data yang di-hardcode di file ini.
 */
export let ADMIN_ROLES: string[] = [];
export let UNIT_KERJA_OPTIONS: string[] = [];
export let DEFAULT_ADMIN_PERMISSIONS: string[] = [];
export let ALL_ADMIN_MENUS: string[] = [];
export let ROLE_LABELS: Record<string, string> = {};
export const labels = ROLE_LABELS;

export type AppRole = string;

/**
 * Sinkronisasi seluruh konstanta sistem secara dinamis dari data Master Options.
 * Fungsi ini memperbarui ADMIN_ROLES, UNIT_KERJA_OPTIONS, dan ROLE_LABELS secara langsung.
 */
export function updateDynamicConstants(masterOptions: any[]) {
  if (!Array.isArray(masterOptions) || masterOptions.length === 0) return;

  const uk = masterOptions
    .filter((o) => o.category === "unit_kerja" && o.is_active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((o) => o.label || o.value);
  if (uk.length > 0) UNIT_KERJA_OPTIONS = uk;

  const roles = masterOptions
    .filter((o) => o.category === "role_admin" && o.is_active !== false)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((o) => o.value);
  if (roles.length > 0) ADMIN_ROLES = roles;

  for (const o of masterOptions) {
    if (o.category === "role_admin" && o.value && o.label) {
      ROLE_LABELS[o.value] = o.label;
    }
  }
}

// =========================================================================
// FUNGSI-FUNGSI RESOLVER DINAMIS DARI DATABASE (MASTER DATA)
// =========================================================================

/**
 * Dapatkan daftar Unit Kerja secara dinamis dari database (Master Options).
 */
export function getDynamicUnitKerja(masterOptions?: any[]): string[] {
  if (Array.isArray(masterOptions) && masterOptions.length > 0) {
    const list = masterOptions
      .filter((o) => o.category === "unit_kerja" && o.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((o) => o.label || o.value);
    if (list.length > 0) return list;
  }
  return [...UNIT_KERJA_OPTIONS];
}

/**
 * Dapatkan daftar Role Admin secara dinamis dari database (Master Options).
 */
export function getDynamicAdminRoles(masterOptions?: any[]): string[] {
  if (Array.isArray(masterOptions) && masterOptions.length > 0) {
    const list = masterOptions
      .filter((o) => o.category === "role_admin" && o.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((o) => o.value);
    if (list.length > 0) return list;
  }
  return [...ADMIN_ROLES];
}

/**
 * Dapatkan mapping label role dinamis dari master options.
 */
export function getDynamicRoleLabels(masterOptions?: any[]): Record<string, string> {
  const map: Record<string, string> = { ...ROLE_LABELS };
  if (Array.isArray(masterOptions)) {
    for (const o of masterOptions) {
      if (o.category === "role_admin" && o.value && o.label) {
        map[o.value] = o.label;
      }
    }
  }
  return map;
}

/**
 * Cek apakah sebuah email adalah Super Admin.
 */
export function isSuperAdmin(email?: string | null): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Cek apakah role termasuk petugas/admin (bisa akses admin panel).
 * Bersifat dinamis: mengenali semua role berawalan "admin_", super_admin, kepala_kantor, kasubag_tu,
 * atau role yang terdaftar di master options.
 */
export function isAdminRole(role?: string | null, customRoles?: string[]): boolean {
  if (!role) return false;
  const r = role.toLowerCase().trim();
  if (r === "user" || r === "pegawai") return false;
  if (customRoles && customRoles.length > 0) {
    return customRoles.includes(r);
  }
  return (
    r.startsWith("admin_") ||
    r === "super_admin" ||
    r === "kepala_kantor" ||
    r === "kasubag_tu" ||
    ADMIN_ROLES.includes(r as any)
  );
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
 * Dapatkan label display untuk sebuah role secara dinamis.
 */
export function getRoleLabel(
  role?: string | null,
  email?: string | null,
  customLabels?: Record<string, string>,
): string {
  const r = role || (isSuperAdmin(email) ? "super_admin" : "");

  // Cek customLabels dari master options database terlebih dahulu
  if (customLabels && customLabels[r]) {
    return customLabels[r];
  }

  if (ROLE_LABELS && ROLE_LABELS[r]) {
    return ROLE_LABELS[r];
  }

  if (r === "super_admin" || isSuperAdmin(email)) return "Super Administrator";
  if (!r) return "Pengguna";

  // Format dinamis jika role baru ditambahkan via Master Data (misal: "admin_humas" -> "Admin Humas")
  return r
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Format badge color untuk role.
 */
export function getRoleBadgeClass(role?: string | null): string {
  switch (role) {
    case "super_admin":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "kepala_kantor":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "kasubag_tu":
      return "bg-indigo-100 text-indigo-800 border-indigo-300";
    case "admin_ptsp":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "pegawai":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "user":
      return "bg-slate-100 text-slate-700 border-slate-300";
    default:
      if (role?.startsWith("admin_")) {
        return "bg-teal-100 text-teal-800 border-teal-300";
      }
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
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
