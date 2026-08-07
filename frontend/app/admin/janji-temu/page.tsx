import { CalendarCheck } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { JanjiTemuClient } from "@/components/admin/janji-temu/janji-temu-client";

export default async function AdminJanjiTemuPage() {
  await requirePermission("janji_temu");

  let entries: any[] = [];
  try {
    const res = await fetchAPI<any>("/appointments");
    if (res && res.data && Array.isArray(res.data)) {
      entries = res.data.map((entry: any) => ({
        ...entry,
        appointmentDate: entry.appointmentDate || entry.appointment_date ? new Date(entry.appointmentDate || entry.appointment_date).toISOString().split('T')[0] : "",
        createdAt: entry.createdAt || entry.created_at ? new Date(entry.createdAt || entry.created_at).toISOString() : new Date().toISOString(),
        updatedAt: entry.updatedAt || entry.updated_at ? new Date(entry.updatedAt || entry.updated_at).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.error("Failed to fetch appointments from Golang API:", err);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Janji Temu"
        description="Pantau dan kelola jadwal janji temu serta pertemuan tatap muka di PTSP Kemenag Barito Utara."
        icon={CalendarCheck}
      />
      <JanjiTemuClient initialEntries={entries} />
    </div>
  );
}
