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
    orderBy: [desc(appointments.appointmentDate), desc(appointments.appointmentTime)],
  });

  const serialized = serializeBigInt(data);
  const entries = serialized.map((entry: any) => ({
    ...entry,
    appointmentDate: entry.appointmentDate ? new Date(entry.appointmentDate).toISOString().split('T')[0] : "",
    createdAt: new Date(entry.createdAt).toISOString(),
    updatedAt: new Date(entry.updatedAt).toISOString(),
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
