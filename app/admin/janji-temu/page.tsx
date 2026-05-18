import { CalendarCheck } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { JanjiTemuClient } from "@/components/admin/janji-temu/janji-temu-client";

export default async function AdminJanjiTemuPage() {
  await requirePermission("janji_temu");

  const data = await db.query.appointments.findMany({
    orderBy: [desc(appointments.appointmentDate)],
  });

  const serialized = serializeBigInt(data) || [];
  const entries = serialized.map((entry: any) => ({
    ...entry,
    id: entry.id.toString(), // ensure string representation for React keys
    createdAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : null,
    updatedAt: entry.updatedAt ? new Date(entry.updatedAt).toISOString() : null,
  }));

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
