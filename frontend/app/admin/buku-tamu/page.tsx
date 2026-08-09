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
        id: String(entry.id),
        guestName: entry.guestName || entry.guest_name || "-",
        whatsapp: entry.whatsapp || "",
        institutionType: entry.institutionType || entry.institution_type || "Umum",
        institutionName: entry.institutionName || entry.institution_name || "",
        intendedOfficer: entry.intendedOfficer || entry.intended_officer || "",
        purpose: entry.purpose || "",
        visitDate: entry.visitDate || entry.visit_date ? new Date(entry.visitDate || entry.visit_date).toISOString() : new Date().toISOString(),
        createdAt: entry.createdAt || entry.created_at ? new Date(entry.createdAt || entry.created_at).toISOString() : new Date().toISOString(),
        updatedAt: entry.updatedAt || entry.updated_at ? new Date(entry.updatedAt || entry.updated_at).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.error("Failed to query guestBook from Golang API:", err);
  }

  let allowManualGuestBookDate = false;
  try {
    const sysRes = await fetchAPI<any>("/admin/system/status");
    if (sysRes && sysRes.data && typeof sysRes.data.allowManualGuestBook === "boolean") {
      allowManualGuestBookDate = sysRes.data.allowManualGuestBook;
    }
  } catch (sysErr) {
    console.error("Failed to query system status from Golang API:", sysErr);
  }

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
