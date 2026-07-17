import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return format(new Date(value), "dd MMMM yyyy HH:mm", { locale: localeId });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function snakeCase(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w\_]+/g, "")
    .replace(/\_\_+/g, "_");
}

export function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }
}

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Diajukan",
  under_review: "Diproses",
  revision_required: "Revisi",
  rejected: "Ditolak",
  approved: "Disetujui",
  completed: "Selesai",
  spam: "Spam / Palsu",
};

export function getStatusTone(status: string) {
  switch (status) {
    case "approved":
    case "completed":
      return "success";
    case "rejected":
      return "danger";
    case "revision_required":
      return "warning";
    case "under_review":
      return "info";
    case "spam":
      return "muted";
    default:
      return "muted";
  }
}

export function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

export function isSafeRedirect(url: string, origin?: string): boolean {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const parsed = new URL(url);
    const allowedOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
    return parsed.origin === allowedOrigin;
  } catch {
    return false;
  }
}

/**
 * Mendapatkan URL publik untuk file berdasarkan prefix storage
 */
export function getFileUrl(path?: string | null) {
  if (!path) return "";

  // Cloudflare R2
  if (path.startsWith("r2:")) {
    const key = path.replace("r2:", "");
    // Kita gunakan proxy internal agar bisa melakukan pre-signing atau jika bucket public bisa langsung domain
    return `/api/files?path=${encodeURIComponent(path)}`;
  }

  return path;
}

export function terbilang(angka: number): string {
  const huruf = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  if (angka < 12) return huruf[angka];
  if (angka < 20) return terbilang(angka - 10) + " Belas";
  if (angka < 100) return terbilang(Math.floor(angka / 10)) + " Puluh " + (angka % 10 ? terbilang(angka % 10) : "");
  if (angka < 200) return "Seratus " + (angka - 100 ? terbilang(angka - 100) : "");
  if (angka < 1000) return terbilang(Math.floor(angka / 100)) + " Ratus " + (angka % 100 ? terbilang(angka % 100) : "");
  return angka.toString();
}

/**
 * Helper untuk menghitung jumlah hari (calendar days) antara 2 tanggal
 */
export function countDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time part to ensure accurate day calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  return diffDays + 1; // inclusive
}
