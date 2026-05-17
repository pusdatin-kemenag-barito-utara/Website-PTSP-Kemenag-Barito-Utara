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
