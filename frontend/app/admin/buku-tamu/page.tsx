import { BookOpen } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { BukuTamuClient } from "@/components/admin/buku-tamu/buku-tamu-client";

export default async function AdminBukuTamuPage() {
  await requirePermission("buku_tamu");

  let entries: any[] = [];
  try {
    const res = await fetchAPI<any>("/guest-book");
    if (res && res.data && Array.isArray(res.data)) {
      entries = res.data.map((entry: any) => ({
        ...entry,
        id: String(entry.id),
        visitDate: entry.visitDate || entry.visit_date ? new Date(entry.visitDate || entry.visit_date).toISOString() : new Date().toISOString(),
        createdAt: entry.createdAt || entry.created_at ? new Date(entry.createdAt || entry.created_at).toISOString() : new Date().toISOString(),
        updatedAt: entry.updatedAt || entry.updated_at ? new Date(entry.updatedAt || entry.updated_at).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.error("Failed to query guestBook from Golang API:", err);
  }

  const allowManualGuestBookDate = false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Buku Tamu"
        description="Pantau dan kelola riwayat kunjungan tamu digital di PTSP Kemenag Barito Utara."
        icon={BookOpen}
      />
      <BukuTamuClient initialEntries={entries} initialAllowManual={allowManualGuestBookDate} />
    </div>
  );
}
